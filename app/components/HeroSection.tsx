'use client';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className={styles.hero}>
      <div className={`${styles.content} fadeInUp`}>
        <div className={styles.logoRow}>
          <span className={styles.logoIcon}>🔤</span>
          <h1 className={styles.logoText}>WordQuest</h1>
        </div>
        <p className={styles.tagline}>Hunt the hidden words. Race the clock. Rule the board.</p>
        <div className={styles.actions}>
          <button className="btn btn-primary pulse" onClick={() => scrollTo('game')}>
            Play Now
          </button>
          <button className="btn btn-outline" onClick={() => scrollTo('howto')}>
            How to Play
          </button>
        </div>
        <div className={styles.scrollHint}>
          <span>Scroll down</span>
          <div className={styles.arrow}>↓</div>
        </div>
      </div>
    </section>
  );
}
