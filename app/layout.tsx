import type { Metadata } from 'next';
import './globals.css';
import ScrollReveal from './components/ScrollReveal';

export const metadata: Metadata = {
  title: 'WordQuest – Word Puzzle Game',
  description: 'Hunt hidden words, beat the clock, rule the board.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ScrollReveal />
      </body>
    </html>
  );
}
