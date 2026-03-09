import HeroSection from './components/HeroSection';
import HowToPlay from './components/HowToPlay';
import GameSection from './components/GameSection';
import StatsSection from './components/StatsSection';
import ParticleCanvas from './components/ParticleCanvas';

export default function Home() {
  return (
    <>
      <ParticleCanvas />
      <HeroSection />
      <HowToPlay />
      <GameSection />
      <StatsSection />
      <footer className="footer">
        <p>Made with ❤️ · WordQuest © 2026</p>
      </footer>
    </>
  );
}
