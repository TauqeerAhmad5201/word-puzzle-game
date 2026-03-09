'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './WordGrid.module.css';
import { FoundMeta } from '../hooks/useGame';

interface Props {
  grid: string[][];
  selectingCells: { r: number; c: number }[];
  foundMeta: FoundMeta;
  foundWords: Set<string>;
  placedWords: { word: string; row: number; col: number; dir: [number,number] }[];
  hintWord: { word: string; row: number; col: number } | null;
  onCellDown: (r: number, c: number) => void;
  onCellEnter: (r: number, c: number) => void;
  onCellUp: () => void;
}

const FOUND_COLORS = [
  'linear-gradient(135deg,#6c63ff,#a78bfa)',
  'linear-gradient(135deg,#ff6584,#f472b6)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f953c6,#b91d73)',
  'linear-gradient(135deg,#00cdac,#02aab0)',
  'linear-gradient(135deg,#fc5c7d,#6a3093)',
];

export default function WordGrid({
  grid, selectingCells, foundMeta, foundWords, placedWords, hintWord,
  onCellDown, onCellEnter, onCellUp,
}: Props) {
  const size = grid.length;
  const gridRef = useRef<HTMLDivElement>(null);

  // Build a lookup: "r,c" → word (if found)
  const cellWordMap: Record<string, string> = {};
  for (const [word, _colorIdx] of Object.entries(foundMeta)) {
    const pw = placedWords.find(p => p.word === word);
    if (!pw) continue;
    const [dr, dc] = pw.dir;
    for (let i = 0; i < word.length; i++) {
      cellWordMap[`${pw.row + dr * i},${pw.col + dc * i}`] = word;
    }
  }

  const selectingSet = new Set(selectingCells.map(c => `${c.r},${c.c}`));

  // Touch move support
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el instanceof HTMLElement) {
      const r = el.dataset.r, c = el.dataset.c;
      if (r !== undefined && c !== undefined) onCellEnter(+r, +c);
    }
  };

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      onMouseLeave={onCellUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={onCellUp}
    >
      {grid.map((row, r) =>
        row.map((letter, c) => {
          const key = `${r},${c}`;
          const isSelecting = selectingSet.has(key);
          const foundWord = cellWordMap[key];
          const isFound = !!foundWord;
          const colorIdx = foundWord !== undefined ? foundMeta[foundWord] : undefined;
          const isHint = hintWord?.row === r && hintWord?.col === c;

          return (
            <div
              key={key}
              data-r={r}
              data-c={c}
              className={[
                styles.cell,
                isSelecting ? styles.selecting : '',
                isFound     ? styles.found     : '',
                isHint      ? styles.hint      : '',
              ].join(' ')}
              style={
                isFound && colorIdx !== undefined
                  ? { background: FOUND_COLORS[colorIdx], color: '#fff' }
                  : undefined
              }
              onMouseDown={() => onCellDown(r, c)}
              onMouseEnter={() => onCellEnter(r, c)}
              onMouseUp={onCellUp}
              onTouchStart={(e) => { e.preventDefault(); onCellDown(r, c); }}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}
