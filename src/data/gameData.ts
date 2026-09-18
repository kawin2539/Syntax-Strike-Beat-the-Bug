import { CharacterClass, BotBugConfig, DifficultyConfig } from '../types';

export const TIMING_WINDOWS = {
  PERFECT_MS: 40,
  GREAT_MS: 80,
};

export const MULTIPLIER_THRESHOLDS = [
  { minCombo: 30, multiplier: 4, name: 'HYPER OVERCLOCK x4' },
  { minCombo: 20, multiplier: 3, name: 'MEGA COMBO x3' },
  { minCombo: 10, multiplier: 2, name: 'SUPER COMBO x2' },
  { minCombo: 0, multiplier: 1, name: 'STANDARD x1' },
];

export function getMultiplier(combo: number): number {
  if (combo >= 30) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  return 1;
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: 'syntax_striker',
    name: 'Syntax Striker',
    title: 'Neon Blade Developer',
    avatarColor: '#06b6d4',
    primaryColor: '#00f0ff',
    perkDescriptionTh: 'สายดาบคะแนนสูง: โบนัสความเสียหายและคะแนนคอมโบ +25%',
    perkDescriptionEn: 'Damage & Score Surge: +25% score and damage on all combos',
    baseHp: 100,
    scoreBonus: 1.25,
    lifeStealPerPerfect: 0,
    shieldMisses: 0,
    damageReduction: 0,
  },
  {
    id: 'debugger_paladin',
    name: 'Debugger Paladin',
    title: 'Kernel Fortress Engineer',
    avatarColor: '#10b981',
    primaryColor: '#34d399',
    perkDescriptionTh: 'สายฟื้นฟู HP: ฟื้นฟู 6 HP ทุกครั้งที่กดจังหวะ Perfect (Max HP 120)',
    perkDescriptionEn: 'Patch Protocol: Restores 6 HP on every Perfect hit (Max HP 120)',
    baseHp: 120,
    scoreBonus: 1.0,
    lifeStealPerPerfect: 6,
    shieldMisses: 0,
    damageReduction: 0.15,
  },
  {
    id: 'overclock_compiler',
    name: 'Overclock Compiler',
    title: 'Turbo Byte Sorcerer',
    avatarColor: '#f59e0b',
    primaryColor: '#fbbf24',
    perkDescriptionTh: 'สายคริติคอลพลังทำลายล้าง: คะแนนและดาเมจ +45% แต่โดนดาเมจแรงขึ้น 20%',
    perkDescriptionEn: 'High Voltage: +45% Score & Damage, but takes +20% incoming damage',
    baseHp: 90,
    scoreBonus: 1.45,
    lifeStealPerPerfect: 0,
    shieldMisses: 0,
    damageReduction: -0.2, // takes more damage
  },
  {
    id: 'buffer_rogue',
    name: 'Buffer Rogue',
    title: 'Hotfix Shadow Specialist',
    avatarColor: '#8b5cf6',
    primaryColor: '#a78bfa',
    perkDescriptionTh: 'สาย Buffer Guard: พลาดได้ 3 ครั้งแรกโดยไม่เสียคอมโบ & ลดดาเมจ 20%',
    perkDescriptionEn: 'Buffer Guard: Absorbs the first 3 Misses without dropping combo',
    baseHp: 100,
    scoreBonus: 1.1,
    lifeStealPerPerfect: 2,
    shieldMisses: 3,
    damageReduction: 0.2,
  },
];

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'very_easy',
    name: 'Very Easy (ฝึกหัด / จังหวะช้ามาก)',
    nameTh: 'ฝึกหัด / จังหวะช้ามาก (50 BPM)',
    bpm: 50,
    noteSpeed: 260, // px per sec
    targetScore: 8000,
    notesPerLoop: 10,
    bugGlitchFreq: 0.04,
    perfectWindowMs: 60,
    greatWindowMs: 110,
    description: 'ความเร็ว 50 BPM, ชุดคอมโบ 10 ตัวอักษร (Perfect ±60ms, Great ±110ms) เหมาะสำหรับฝึกกดลูกศรและปิดคอมโบด้วย Spacebar',
  },
  {
    id: 'easy',
    name: 'Easy (ง่าย / ปรับพื้นฐาน)',
    nameTh: 'ง่าย / ปรับพื้นฐาน (75 BPM)',
    bpm: 75,
    noteSpeed: 320,
    targetScore: 12000,
    notesPerLoop: 12,
    bugGlitchFreq: 0.07,
    perfectWindowMs: 50,
    greatWindowMs: 95,
    description: 'ความเร็ว 75 BPM, ชุดคอมโบ 12 ตัวอักษร (Perfect ±50ms, Great ±95ms) กดต่อเนื่องให้ครบชุดเพื่อเปิดคอมโบพลังทำลาย',
  },
  {
    id: 'normal',
    name: 'Normal (ปกติ / จังหวะมาตรฐาน)',
    nameTh: 'ปกติ / จังหวะมาตรฐาน (95 BPM)',
    bpm: 95,
    noteSpeed: 390,
    targetScore: 16000,
    notesPerLoop: 14,
    bugGlitchFreq: 0.12,
    perfectWindowMs: 40,
    greatWindowMs: 80,
    description: 'ความเร็ว 95 BPM, ชุดคอมโบ 14 ตัวอักษร (Perfect ±40ms, Great ±80ms) จังหวะกระชับต่อเนื่อง สนุกสนานและท้าทายสมาธิ',
  },
  {
    id: 'hard',
    name: 'Hard (ท้าทาย / ความเร็วสูง)',
    nameTh: 'ท้าทาย / ความเร็วสูง (120 BPM)',
    bpm: 120,
    noteSpeed: 470,
    targetScore: 22000,
    notesPerLoop: 16,
    bugGlitchFreq: 0.20,
    perfectWindowMs: 35,
    greatWindowMs: 70,
    description: 'ความเร็ว 120 BPM, ชุดคอมโบ 16 ตัวอักษร (Perfect ±35ms, Great ±70ms) ความเร็วและลูกศรชุดใหญ่ บอสปล่อยบั๊กกลิตช์',
  },
  {
    id: 'expert',
    name: 'Expert (ผู้เชี่ยวชาญ / รวดเร็วมาก)',
    nameTh: 'ผู้เชี่ยวชาญ / รวดเร็วมาก (150 BPM)',
    bpm: 150,
    noteSpeed: 550,
    targetScore: 28000,
    notesPerLoop: 18,
    bugGlitchFreq: 0.28,
    perfectWindowMs: 30,
    greatWindowMs: 55,
    description: 'ความเร็ว 150 BPM, ชุดคอมโบ 18 ตัวอักษร (Perfect ±30ms, Great ±55ms) สำหรับมือโปรที่ต้องการความตื่นเต้นและกดต่อเนื่องสะใจ',
  },
  {
    id: 'overclock',
    name: 'Overclock (โอเวอร์คล็อก / ขีดสุด 180 BPM)',
    nameTh: 'โอเวอร์คล็อก / ขีดสุดความเร็ว (180 BPM)',
    bpm: 180,
    noteSpeed: 640,
    targetScore: 35000,
    notesPerLoop: 20,
    bugGlitchFreq: 0.35,
    perfectWindowMs: 24,
    greatWindowMs: 45,
    description: 'ความเร็วสูงสุด 180 BPM! ชุดคอมโบเต็มพิกัด 20 ตัวอักษร (Perfect ±24ms, Great ±45ms) ท้าทายสมาธิและปฏิกิริยาตอบสนองขั้นสูงสุด',
  },
];

export const BUGS: BotBugConfig[] = [
  {
    id: 'null_pointer',
    name: 'NullPointer Spider',
    species: 'Fatal Exception Class 0x00',
    color: '#ef4444',
    secondaryColor: '#f87171',
    description: 'แมงมุมไวรัสที่มีก้ามคมกริบ ก่อให้เกิด Null Pointer Exception ในหน่วยความจำ',
    specialMoveName: 'Glitch Inversion',
    specialMoveTh: 'บิดเบือนภาพลูกศรชั่วขณะ (Glitch Effect)',
  },
  {
    id: 'memory_leak',
    name: 'MemoryLeak Swarm',
    species: 'Heap Drain Virus',
    color: '#a855f7',
    secondaryColor: '#c084fc',
    description: 'กลุ่มก้อนปรสิตกลืนกิน RAM ทำให้ระบบเริ่มสูญเสียการควบคุม',
    specialMoveName: 'RAM Overload',
    specialMoveTh: 'เร่งความเร็วโน้ตชั่วคราว (Speed Up Attack)',
  },
  {
    id: 'stack_overflow',
    name: 'StackOverflow Behemoth',
    species: 'Infinite Recursion Titan',
    color: '#f97316',
    secondaryColor: '#fb923c',
    description: 'ยักษ์ใหญ่บั๊กที่ทำให้เกิดลูปไม่มีที่สิ้นสุด ถึกและสร้างความเสียหายรุนแรง',
    specialMoveName: 'Call Stack Collapse',
    specialMoveTh: 'Glitch Blindness + ดาเมจสวนกลับมหาศาล',
  },
];
