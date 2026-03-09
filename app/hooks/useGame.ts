'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Difficulty, CONFIGS, WORD_BANKS,
  buildGrid, getCellsBetween, calcWordScore, shuffle, PlacedWord,
} from '../lib/gameLogic';

export interface GameState {
  grid: string[][];
  words: string[];
  foundWords: Set<string>;
  placedWords: PlacedWord[];
  score: number;
  timeLeft: number;
  gameActive: boolean;
  status: 'idle' | 'playing' | 'won' | 'lost';
  difficulty: Difficulty;
}

export interface SelectionState {
  selecting: boolean;
  startCell: { r: number; c: number } | null;
  currentCells: { r: number; c: number }[];
}

export interface FoundMeta {
  [word: string]: number; // colorIndex
}

function makeInitialState(d: Difficulty): GameState {
  const cfg = CONFIGS[d];
  const words = shuffle([...WORD_BANKS[d]]).slice(0, cfg.wordCount);
  const { grid, placedWords } = buildGrid(cfg.gridSize, words);
  return {
    grid, words, placedWords,
    foundWords: new Set(),
    score: 0,
    timeLeft: cfg.time,
    gameActive: true,
    status: 'playing',
    difficulty: d,
  };
}

export function useGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => makeInitialState('easy'));
  const [selection, setSelection] = useState<SelectionState>({
    selecting: false, startCell: null, currentCells: [],
  });
  const [foundMeta, setFoundMeta] = useState<FoundMeta>({});
  const [lastWord, setLastWord] = useState<{ word: string; points: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Start game ──────────────────────────────────────────
  const startGame = useCallback((diff?: Difficulty) => {
    const d = diff ?? difficulty;
    if (timerRef.current) clearInterval(timerRef.current);
    setFoundMeta({});
    setLastWord(null);
    setSelection({ selecting: false, startCell: null, currentCells: [] });
    setGameState(makeInitialState(d));
  }, [difficulty]);

  // ── Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const t = prev.timeLeft - 1;
        if (t <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, timeLeft: 0, gameActive: false, status: 'lost' };
        }
        return { ...prev, timeLeft: t };
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [gameState.status]);

  // ── Selection ───────────────────────────────────────────
  const onCellDown = useCallback((r: number, c: number) => {
    if (!gameState.gameActive) return;
    setSelection({ selecting: true, startCell: { r, c }, currentCells: [{ r, c }] });
  }, [gameState.gameActive]);

  const onCellEnter = useCallback((r: number, c: number) => {
    setSelection(prev => {
      if (!prev.selecting || !prev.startCell) return prev;
      const cells = getCellsBetween(prev.startCell.r, prev.startCell.c, r, c);
      return { ...prev, currentCells: cells };
    });
  }, []);

  const onCellUp = useCallback(() => {
    setSelection(prev => {
      if (!prev.selecting) return { ...prev, selecting: false };

      const cells = prev.currentCells;
      const forward  = cells.map(({ r, c }) => gameState.grid[r][c]).join('');
      const backward = [...forward].reverse().join('');

      for (const word of gameState.words) {
        if ((forward === word || backward === word) && !gameState.foundWords.has(word)) {
          const colorIdx = gameState.foundWords.size % 8;
          const points = calcWordScore(word.length, gameState.difficulty);

          setFoundMeta(fm => ({ ...fm, [word]: colorIdx }));
          setLastWord({ word, points });
          setTimeout(() => setLastWord(null), 900);

          setGameState(gs => {
            const newFound = new Set(gs.foundWords);
            newFound.add(word);
            const newScore = gs.score + points;
            const won = newFound.size === gs.words.length;
            if (won) clearInterval(timerRef.current!);
            return {
              ...gs,
              foundWords: newFound,
              score: newScore + (won ? gs.timeLeft * 2 : 0),
              gameActive: !won,
              status: won ? 'won' : 'playing',
            };
          });
          break;
        }
      }
      return { selecting: false, startCell: null, currentCells: [] };
    });
  }, [gameState]);

  // ── Persist stats ───────────────────────────────────────
  useEffect(() => {
    if (gameState.status !== 'won' && gameState.status !== 'lost') return;
    const raw = localStorage.getItem('wq_stats');
    const stats = raw ? JSON.parse(raw) : { played: 0, won: 0, best: 0, words: 0 };
    stats.played++;
    if (gameState.status === 'won') stats.won++;
    if (gameState.score > stats.best) stats.best = gameState.score;
    stats.words += gameState.foundWords.size;
    localStorage.setItem('wq_stats', JSON.stringify(stats));
    window.dispatchEvent(new Event('storage'));
  }, [gameState.status]);

  // ── Hint ────────────────────────────────────────────────
  const showHint = useCallback((): PlacedWord | null => {
    if (!gameState.gameActive) return null;
    const unfound = gameState.placedWords.filter(p => !gameState.foundWords.has(p.word));
    if (!unfound.length) return null;
    setGameState(gs => ({ ...gs, score: Math.max(0, gs.score - 20) }));
    return unfound[0];
  }, [gameState]);

  return {
    gameState, selection, foundMeta, lastWord, difficulty,
    startGame, setDifficulty, onCellDown, onCellEnter, onCellUp, showHint,
  };
}
