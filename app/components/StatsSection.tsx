'use client';
import { useEffect, useState } from 'react';
import styles from './StatsSection.module.css';

interface StatsData {
  played: number;
  won: number;
  best: number;
  words: number;
}

export default function StatsSection() {
  const [s, setS] = useState<StatsData>({ played: 0, won: 0, best: 0, words: 0 });

  useEffect(() => {
    const raw = localStorage.getItem('wq_stats');
    if (raw) setS(JSON.parse(raw));
    const onStorage = () => {
      const r = localStorage.getItem('wq_stats');
      if (r) setS(JSON.parse(r));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const winRate = s.played ? Math.round((s.won / s.played) * 100) : 0;

  const cards = [
    { value: s.played,     label: 'Games Played' },
    { value: s.best,       label: 'Best Score' },
    { value: s.words,      label: 'Words Found' },
    { value: `${winRate}%`, label: 'Win Rate' },
  ];

  return (
    <section className={styles.section}>
      <h2 className={`${styles.title} reveal`}>Your Stats</h2>
      <div className={`${styles.grid} reveal`}>
        {cards.map(c => (
          <div key={c.label} className={styles.card}>
            <div className={styles.number}>{c.value}</div>
            <div className={styles.desc}>{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
