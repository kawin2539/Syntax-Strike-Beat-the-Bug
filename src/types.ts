export type NoteType = 'left' | 'up' | 'down' | 'right' | 'space';

export type HitRating = 'PERFECT' | 'GREAT' | 'MISS';

export interface GameNote {
  id: number;
  type: NoteType;
  timeMs: number; // exact target time in milliseconds relative to song start
  loopIndex: number;
  isFinisher: boolean; // Spacebar finisher at the end of loop
  hit: boolean;
  hitRating?: HitRating;
  missed?: boolean;
}

export type DifficultyLevel = 'very_easy' | 'easy' | 'normal' | 'hard' | 'expert' | 'overclock';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  nameTh: string;
  bpm: number;
  noteSpeed: number; // pixels per second
  targetScore: number;
  notesPerLoop: number;
  bugGlitchFreq: number; // probability / frequency of bug attacks
  perfectWindowMs: number; // e.g. 60ms, 40ms, 30ms
  greatWindowMs: number; // e.g. 110ms, 80ms, 60ms
  description: string;
}

export type CharacterClassId = 'syntax_striker' | 'debugger_paladin' | 'overclock_compiler' | 'buffer_rogue';

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  title: string;
  avatarColor: string;
  primaryColor: string;
  perkDescriptionTh: string;
  perkDescriptionEn: string;
  baseHp: number;
  scoreBonus: number; // multiplier e.g. 1.15
  lifeStealPerPerfect: number; // HP healed on perfect
  shieldMisses: number; // number of misses spared before dropping combo
  damageReduction: number; // 0.2 = 20%
}

export type BotBugId = 'null_pointer' | 'memory_leak' | 'stack_overflow';

export interface BotBugConfig {
  id: BotBugId;
  name: string;
  species: string;
  color: string;
  secondaryColor: string;
  description: string;
  specialMoveName: string;
  specialMoveTh: string;
}

export type ItemDropType = 'FREEZE' | 'HEAL' | 'AUTOSPACE';

export interface FloatingText {
  id: number;
  text: string;
  rating?: HitRating;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
  isDamage?: boolean;
}

export interface SlashEffect {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  life: number;
  maxLife: number;
  isFinisher: boolean;
  angle: number;
  width: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  shape?: 'pixel' | 'spark' | 'binary';
  char?: string;
}

export interface GameStats {
  score: number;
  targetScore: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  elapsedTimeMs: number;
  playerHp: number;
  playerMaxHp: number;
  botHp: number;
  botMaxHp: number;
  shieldsRemaining: number;
}

export type GameScreen = 'MENU' | 'PLAYING' | 'PAUSED' | 'SUMMARY';
