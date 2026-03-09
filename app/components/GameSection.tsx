'use client';
import { useState, useCallback, useRef } from 'react';
import styles from './GameSection.module.css';
import WordGrid from './WordGrid';
import WordPanel from './WordPanel';
import ConfettiCanvas from './ConfettiCanvas';
import { useGame } from '../hooks/useGame';
import { Difficulty } from '../lib/gameLogic';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function GameSection() {
  const {
    gameState, selection, foundMeta, lastWord, difficulty,
    startGame, setDifficulty, onCellDown, onCellEnter, onCellUp, showHint,
  } = useGame();

  const [hintCell, setHintCell] = useState<{ word: string; row: number; col: number } | null>(null);
  const [hintWord, setHintWord] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleHint = useCallback(() => {
    const placed = showHint();
    if (placed) {
      setHintCell({ word: placed.word, row: placed.row, col: placed.col });
      setHintWord(placed.word);
      setTimeout(() => { setHintCell(null); setHintWord(null); }, 2500);
    }
  }, [showHint]);

  const handleDiff = (d: Difficulty) => {
    setDifficulty(d);
    startGame(d);
  };

  const { grid, words, foundWords, placedWords, score, timeLeft, status } = gameState;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const timerStr = `${mm}:${ss}`;
  const danger = timeLeft <= 15 && status === 'playing';
  const won  = status === 'won';
  const lost = status === 'lost';

  return (
    <section id="game" ref={sectionRef} className={styles.section}>
      <ConfettiCanvas active={won} />

      {/* Score bar */}
      <div className={styles.header}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Score</span>
          <span className={styles.statVal}>{score}</span>
        </div>
        <div className={`${styles.stat} ${danger ? styles.danger : ''}`}>
          <span className={styles.statLabel}>Time</span>
          <span className={`${styles.statVal} ${styles.timerVal}`}>{timerStr}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Words</span>
          <span className={styles.statVal}>{foundWords.size} / {words.length}</span>
        </div>
        <div className={styles.diffRow}>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              className={`${styles.diffBtn} ${difficulty === d ? styles.active : ''}`}
              onClick={() => handleDiff(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Game body */}
      <div className={styles.body}>
        <div className={styles.gridWrap}>
          <WordGrid
            grid={grid}
            selectingCells={selection.currentCells}
            foundMeta={foundMeta}
            foundWords={foundWords}
            placedWords={placedWords}
            hintWord={hintCell}
            onCellDown={onCellDown}
            onCellEnter={onCellEnter}
            onCellUp={onCellUp}
          />
          {/* Floating point pop */}
          {lastWord && (
            <div className={styles.wordPop}>+{lastWord.points}</div>
          )}
        </div>

        <WordPanel
          words={words}
          foundWords={foundWords}
          foundMeta={foundMeta}
          hintWord={hintWord}
          onNewGame={() => startGame()}
          onHint={handleHint}
        />
      </div>

      {/* Win / Lose overlay */}
      {(won || lost) && (
        <div className={styles.overlay}>
          <div className={styles.overlayBox}>
            <div className={styles.overlayEmoji}>{won ? '🎉' : '😢'}</div>
            <h2>{won ? 'You Win!' : "Time's Up!"}</h2>
            <p>
              {won
                ? `Score: ${score} · Time bonus included!`
                : `Found ${foundWords.size} of ${words.length} words.`}
            </p>
            <button className="btn btn-primary" onClick={() => startGame()}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
