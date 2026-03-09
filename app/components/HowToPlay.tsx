import styles from './HowToPlay.module.css';

const CARDS = [
  { icon: '👁️', title: 'Spot the Word',  body: 'Find words hidden in the grid — horizontally, vertically, or diagonally.' },
  { icon: '🖱️', title: 'Drag to Select', body: 'Click the first letter, drag through the word, release to confirm.' },
  { icon: '⏱️', title: 'Beat the Clock', body: 'Find all words before time runs out to earn bonus points.' },
  { icon: '🏆', title: 'Score Big',       body: 'Longer words = higher score. Challenge yourself with harder difficulties.' },
];

export default function HowToPlay() {
  return (
    <section id="howto" className={styles.section}>
      <h2 className={`${styles.title} reveal`}>How to Play</h2>
      <div className={`${styles.cards} reveal`}>
        {CARDS.map(c => (
          <div key={c.title} className={styles.card}>
            <div className={styles.cardIcon}>{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
