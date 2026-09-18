import { Trophy, Skull, RotateCcw, Home, Download, Award, Zap, Clock, Activity, Target } from 'lucide-react';
import { GameStats, CharacterClass, BotBugConfig, DifficultyConfig } from '../types';
import { generateSingleFileHtml } from '../utils/singleFileExport';

interface SummaryModalProps {
  won: boolean;
  stats: GameStats;
  playerClass: CharacterClass;
  botConfig: BotBugConfig;
  difficulty: DifficultyConfig;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const SummaryModal = ({
  won,
  stats,
  playerClass,
  botConfig,
  difficulty,
  onPlayAgain,
  onBackToMenu,
}: SummaryModalProps) => {
  // Accuracy calculation
  const totalNotesHit = stats.perfectCount + stats.greatCount + stats.missCount;
  const accuracyPct = totalNotesHit > 0
    ? Math.round(((stats.perfectCount * 1.0 + stats.greatCount * 0.7) / totalNotesHit) * 100)
    : 0;

  // Rating Grade calculation
  let grade = 'C';
  let gradeColor = 'text-slate-400';
  if (won) {
    if (accuracyPct >= 95 && stats.missCount === 0) {
      grade = 'S+';
      gradeColor = 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]';
    } else if (accuracyPct >= 85) {
      grade = 'A';
      gradeColor = 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]';
    } else if (accuracyPct >= 70) {
      grade = 'B';
      gradeColor = 'text-emerald-400';
    } else {
      grade = 'C';
      gradeColor = 'text-slate-300';
    }
  } else {
    grade = 'F';
    gradeColor = 'text-red-500';
  }

  // EXP earned formula
  const baseExp = won ? 500 : 150;
  const expEarned = Math.round(
    baseExp + (stats.score * 0.05) + (stats.maxCombo * 10) + (stats.perfectCount * 5)
  );

  // Format clear time MM:SS
  const totalSeconds = Math.floor(stats.elapsedTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleDownloadSingleFile = () => {
    const htmlContent = generateSingleFileHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SyntaxStrike_BeatTheBug.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="summary-modal-root" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700 max-w-lg w-full rounded-xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
        
        {/* HEADER RESULT BANNER */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-2 bg-slate-950 border-2 border-slate-700">
            {won ? (
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            ) : (
              <Skull className="w-8 h-8 text-red-500 animate-pulse" />
            )}
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl tracking-wider uppercase drop-shadow-md">
            {won ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-emerald-300 to-cyan-400">
                BUG CRUSHED! VICTORY!
              </span>
            ) : (
              <span className="text-red-500">
                SYSTEM CRASH! DEFEAT!
              </span>
            )}
          </h2>

          <p className="text-xs text-slate-400 font-mono mt-1">
            {won
              ? `คุณปราบ ${botConfig.name} สำเร็จและฟื้นฟูระบบได้เรียบร้อย!`
              : `พลังชีวิตหมดลง! ${botConfig.name} ยึดครองเคอร์เนลระบบไว้ได้`}
          </p>
        </div>

        {/* GRADE & TOTAL SCORE BLOCK */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">TOTAL SCORE / เปรียบเทียบคะแนน</div>
            <div className="font-pixel text-xl sm:text-2xl text-cyan-300 mt-1">
              {stats.score.toLocaleString()} <span className="text-xs text-slate-500">/ {stats.targetScore.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              ความคืบหน้าเป้าหมาย: {Math.min(100, Math.floor((stats.score / stats.targetScore) * 100))}%
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">RANK</div>
            <div className={`font-pixel text-3xl ${gradeColor}`}>
              {grade}
            </div>
          </div>
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>MAX COMBO</span>
            </div>
            <div className="font-pixel text-base text-yellow-400 mt-1">
              {stats.maxCombo}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>ACCURACY</span>
            </div>
            <div className="font-pixel text-base text-cyan-300 mt-1">
              {accuracyPct}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>DAMAGE DEALT</span>
            </div>
            <div className="font-pixel text-base text-rose-400 mt-1">
              {stats.totalDamageDealt}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>CLEAR TIME</span>
            </div>
            <div className="font-pixel text-base text-emerald-400 mt-1">
              {timeFormatted}
            </div>
          </div>
        </div>

        {/* HIT TIMING BREAKDOWN & EXP */}
        <div className="bg-slate-950/60 border border-slate-800 rounded p-3 text-xs space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-cyan-400 font-pixel text-[10px]">★ PERFECT (±40ms)</span>
            <span className="font-mono font-bold text-white">{stats.perfectCount} hits</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-400 font-pixel text-[10px]">▲ GREAT (±80ms)</span>
            <span className="font-mono font-bold text-white">{stats.greatCount} hits</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-rose-400 font-pixel text-[10px]">✕ MISS (&gt;80ms / ผิดปุ่ม)</span>
            <span className="font-mono font-bold text-white">{stats.missCount} misses</span>
          </div>

          <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-[11px]">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Award className="w-4 h-4" />
              <span className="font-pixel text-[10px]">EXP GAINED</span>
            </div>
            <span className="font-pixel text-purple-300">+{expEarned} EXP</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            id="btn-play-again"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 active:scale-95 text-slate-950 font-pixel text-xs font-bold rounded flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>เล่นอีกครั้ง (REPLAY)</span>
          </button>

          <button
            id="btn-back-menu"
            onClick={onBackToMenu}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-pixel text-xs rounded flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>กลับสู่เมนู</span>
          </button>
        </div>

        {/* STANDALONE FILE EXPORT BUTTON */}
        <button
          id="btn-summary-download-html"
          onClick={handleDownloadSingleFile}
          className="w-full py-2 px-3 bg-purple-950/70 hover:bg-purple-900 active:scale-95 border border-purple-600/60 text-purple-300 font-pixel text-[9px] rounded flex items-center justify-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>ดาวน์โหลด Standalone Single-File HTML (เล่นออฟไลน์ได้ทันที)</span>
        </button>

      </div>
    </div>
  );
};
