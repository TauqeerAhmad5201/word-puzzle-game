'use client';
import styles from './WordPanel.module.css';
import { FoundMeta } from '../hooks/useGame';

interface Props {
  words: string[];
  foundWords: Set<string>;
  foundMeta: FoundMeta;
  hintWord: string | null;
  onNewGame: () => void;
  onHint: () => void;
}

const FOUND_COLORS = [
  '#a78bfa','#f472b6','#43e97b','#ffd200',
  '#4facfe','#f953c6','#00cdac','#fc5c7d',
];

export default function WordPanel({ words, foundWords, foundMeta, hintWord, onNewGame, onHint }: Props) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Find These Words</h3>
      <ul className={styles.list}>
        {words.map(word => {
          const isFnd = foundWords.has(word);
          const ci = foundMeta[word];
          return (
            <li
              key={word}
              className={[
                styles.item,
                isFnd ? styles.found : '',
                hintWord === word ? styles.hint : '',
              ].join(' ')}
              style={isFnd && ci !== undefined ? { color: FOUND_COLORS[ci] } : undefined}
            >
              {word}
              {isFnd && <span className={styles.check}>✓</span>}
            </li>
          );
        })}
      </ul>
      <div className={styles.actions}>
        <button className="btn btn-outline btn-small" onClick={onNewGame}>🔄 New Game</button>
        <button className="btn btn-outline btn-small" onClick={onHint}>💡 Hint (−20)</button>
      </div>
    </div>
  );
}
