// ── Types ─────────────────────────────────────────────────
export interface Cell {
  letter: string;
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dir: [number, number];
}

export interface GameConfig {
  gridSize: number;
  wordCount: number;
  time: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// ── Constants ─────────────────────────────────────────────
export const WORD_BANKS: Record<Difficulty, string[]> = {
  easy: [
    'CAT','DOG','SUN','MAP','FLY','RUN','BIG','HAT','JAR','ZIP',
    'KEY','LAP','MUD','NET','OAK','PEN','RIB','SAP','TAN','VAN',
  ],
  medium: [
    'PUZZLE','WORD','BRAIN','QUEST','MAGIC','STORM','FLAME','LIGHT',
    'CROWN','BRICK','GRAPE','JUDGE','KNEEL','LUNAR','MAPLE','NOVEL',
  ],
  hard: [
    'SORCERY','PHANTOM','CRYPTIC','ORBITAL','ECLIPSE','RADIANT',
    'JOURNEY','WHISPER','KINGDOM','LANTERN','SOLSTICE','MERCURY',
  ],
};

export const CONFIGS: Record<Difficulty, GameConfig> = {
  easy:   { gridSize: 10, wordCount: 6,  time: 120 },
  medium: { gridSize: 12, wordCount: 7,  time: 150 },
  hard:   { gridSize: 14, wordCount: 8,  time: 180 },
};

const DIRECTIONS: [number, number][] = [
  [0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1],
];

// ── Helpers ───────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Grid builder ──────────────────────────────────────────
export function buildGrid(
  size: number,
  words: string[]
): { grid: string[][]; placedWords: PlacedWord[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords: PlacedWord[] = [];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (canPlace(grid, word, row, col, dir, size)) {
        placeWord(grid, word, row, col, dir);
        placedWords.push({ word, row, col, dir });
        placed = true;
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c])
        grid[r][c] = letters[Math.floor(Math.random() * 26)];

  return { grid, placedWords };
}

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  [dr, dc]: [number, number],
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  [dr, dc]: [number, number]
): void {
  for (let i = 0; i < word.length; i++)
    grid[row + dr * i][col + dc * i] = word[i];
}

// ── Selection helper ──────────────────────────────────────
export function getCellsBetween(
  r1: number, c1: number,
  r2: number, c2: number
): { r: number; c: number }[] {
  const dr = r2 - r1, dc = c2 - c1;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [{ r: r1, c: c1 }];

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) {
    // Not a valid diagonal — use dominant axis
    const cells: { r: number; c: number }[] = [];
    for (let i = 0; i <= len; i++) cells.push({ r: r1 + stepR * i, c: c1 });
    return cells;
  }

  const cells: { r: number; c: number }[] = [];
  for (let i = 0; i <= len; i++) cells.push({ r: r1 + stepR * i, c: c1 + stepC * i });
  return cells;
}

// ── Score ─────────────────────────────────────────────────
export function calcWordScore(wordLen: number, diff: Difficulty): number {
  const mult = diff === 'easy' ? 1 : diff === 'medium' ? 1.5 : 2;
  return Math.round(wordLen * 10 * mult);
}
