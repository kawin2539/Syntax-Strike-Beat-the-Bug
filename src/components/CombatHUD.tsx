import { Volume2, VolumeX, Pause, Play, Zap, Shield, Sparkles, Snowflake, AlertTriangle } from 'lucide-react';
import { CharacterClass, BotBugConfig, GameStats, NoteType } from '../types';

export interface CombatHUDProps {
  stats: GameStats;
  playerClass: CharacterClass;
  botConfig: BotBugConfig;
  isGlitchActive: boolean;
  isFrozen: boolean;
  autoSpaceActive: boolean;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onButtonPress?: (type: NoteType) => void;
  finisherApproaching?: boolean;
}

export const CombatHUD = ({
  stats,
  playerClass,
  botConfig,
  isGlitchActive,
  isFrozen,
  autoSpaceActive,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onButtonPress,
  finisherApproaching = false,
}: CombatHUDProps) => {
  const playerHpPct = Math.max(0, Math.min(100, (stats.playerHp / stats.playerMaxHp) * 100));
  const progressPct = Math.max(0, Math.min(100, Math.floor((stats.score / stats.targetScore) * 100)));

  // Multiplier style
  const getMultiplierStyle = () => {
    switch (stats.multiplier) {
      case 4:
        return 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white border-pink-400 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.8)]';
      case 3:
        return 'bg-amber-600/90 text-amber-100 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]';
      case 2:
        return 'bg-blue-600/90 text-cyan-100 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]';
      default:
        return 'bg-slate-800/90 text-slate-300 border-slate-600';
    }
  };

  return (
    <div id="combat-hud-root" className="w-full select-none pointer-events-auto">
      {/* TOP STATUS BARS */}
      <div className="w-full bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-2 py-1.5 sm:px-4 sm:py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* PLAYER HEALTH */}
          <div className="flex-1 min-w-0 max-w-[240px] sm:max-w-[280px]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
              <div className="flex items-center gap-1 min-w-0 truncate">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: playerClass.primaryColor }}></span>
                <span className="font-bold text-white font-pixel text-[9px] sm:text-[10px] truncate">{playerClass.name}</span>
              </div>
              <span className="text-[9px] sm:text-[11px] font-mono text-emerald-400 font-bold shrink-0 ml-1">
                {Math.round(stats.playerHp)}/{stats.playerMaxHp}
              </span>
            </div>
            {/* HP Bar */}
            <div className="w-full bg-slate-900 h-2 sm:h-3 border border-slate-700 p-0.5 rounded-sm">
              <div
                className={`h-full transition-all duration-150 ${
                  playerHpPct > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : playerHpPct > 25
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
            {stats.shieldsRemaining > 0 && (
              <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-[9px] text-purple-300">
                <Shield className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                <span>Shield: {stats.shieldsRemaining}</span>
              </div>
            )}
          </div>

          {/* CENTER CONTROLS & COMBO MULTIPLIER */}
          <div className="flex flex-col items-center shrink-0 px-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <button
                id="btn-toggle-sound"
                onClick={onToggleMute}
                className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded transition"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
              </button>
              <button
                id="btn-toggle-pause"
                onClick={onTogglePause}
                className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded transition"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
              </button>
            </div>

            {/* COMBO BADGE */}
            <div className="flex items-center gap-1">
              {stats.combo < 10 ? (
                <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-800/60 text-[8px] sm:text-[9px]" title="กดต่อเนื่องให้ครบ 10-20 ตัวอักษรเพื่อเปิดคอมโบ x2+">
                  <span className="font-pixel text-slate-400 text-[7px] sm:text-[8px]">CHARGE</span>
                  <span className="font-mono text-cyan-400 font-bold">{stats.combo}/10</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-[8px] sm:text-[9px] text-yellow-400 whitespace-nowrap animate-pulse">
                    🔥 COMBO {stats.combo}
                  </span>
                </div>
              )}
              <div className={`px-1.5 py-0.2 rounded border text-[9px] sm:text-[10px] font-pixel font-bold whitespace-nowrap ${getMultiplierStyle()}`}>
                x{stats.multiplier}
              </div>
            </div>
          </div>

          {/* BOT HP / TARGET PROGRESS */}
          <div className="flex-1 min-w-0 max-w-[240px] sm:max-w-[280px]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
              <span className="text-[9px] sm:text-[11px] font-mono text-cyan-400 font-bold shrink-0">
                {progressPct}%
              </span>
              <div className="flex items-center gap-1 min-w-0 truncate ml-1">
                <span className="font-bold text-red-400 font-pixel text-[9px] sm:text-[10px] truncate">{botConfig.name}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0"></span>
              </div>
            </div>
            {/* Target Progress Bar */}
            <div className="w-full bg-slate-900 h-2 sm:h-3 border border-slate-700 p-0.5 rounded-sm">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-0.5 text-[8px] sm:text-[9px] text-slate-400">
              <span className="truncate">Score: {stats.score.toLocaleString()}</span>
              <span className="shrink-0 ml-1">Tgt: {stats.targetScore.toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* ACTIVE BUFF / GLITCH WARNING BANNER */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 text-[9px]">
          {isGlitchActive && (
            <div className="bg-red-950/90 text-red-300 border border-red-500 px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce font-pixel text-[8px]">
              <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
              <span>GLITCH DISTORTION!</span>
            </div>
          )}

          {isFrozen && (
            <div className="bg-cyan-950/90 text-cyan-200 border border-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-pixel text-[8px]">
              <Snowflake className="w-3 h-3 text-cyan-300 shrink-0" />
              <span>FREEZE: -35% SPEED</span>
            </div>
          )}

          {autoSpaceActive && (
            <div className="bg-amber-950/90 text-amber-200 border border-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-pixel text-[8px]">
              <Zap className="w-3 h-3 text-amber-300 shrink-0" />
              <span>AUTO-SPACE READY!</span>
            </div>
          )}

          {stats.multiplier >= 4 && (
            <div className="bg-pink-950/90 text-pink-200 border border-pink-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-pixel text-[8px] animate-pulse">
              <Sparkles className="w-3 h-3 text-pink-300 shrink-0" />
              <span>HYPER OVERCLOCK!</span>
            </div>
          )}
        </div>
      </div>

      {/* RENDER CONTROLS IF ONBUTTONPRESS PASSED DIRECTLY */}
      {onButtonPress && (
        <CombatControls onButtonPress={onButtonPress} finisherApproaching={finisherApproaching} />
      )}
    </div>
  );
};

export interface CombatControlsProps {
  onButtonPress: (type: NoteType) => void;
  finisherApproaching?: boolean;
}

export const CombatControls = ({
  onButtonPress,
  finisherApproaching = false,
}: CombatControlsProps) => {
  return (
    <div
      id="combat-controls-root"
      className="w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-2 sm:py-2 sm:px-4 select-none touch-manipulation z-20"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        
        {/* DIRECTIONAL PAD */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full sm:w-auto">
          <button
            id="btn-input-left"
            onPointerDown={(e) => { e.preventDefault(); onButtonPress('left'); }}
            className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-3 bg-cyan-950/80 hover:bg-cyan-900 active:bg-cyan-500 active:text-black border-2 border-cyan-500 rounded text-cyan-300 font-pixel text-xs transition duration-75 min-h-[44px] shadow-[0_0_10px_rgba(6,182,212,0.3)] touch-manipulation"
          >
            <span className="text-base sm:text-lg leading-none">◀</span>
            <span className="text-[8px] text-cyan-400/80 mt-0.5 font-mono">LEFT</span>
          </button>

          <button
            id="btn-input-up"
            onPointerDown={(e) => { e.preventDefault(); onButtonPress('up'); }}
            className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-3 bg-emerald-950/80 hover:bg-emerald-900 active:bg-emerald-500 active:text-black border-2 border-emerald-500 rounded text-emerald-300 font-pixel text-xs transition duration-75 min-h-[44px] shadow-[0_0_10px_rgba(16,185,129,0.3)] touch-manipulation"
          >
            <span className="text-base sm:text-lg leading-none">▲</span>
            <span className="text-[8px] text-emerald-400/80 mt-0.5 font-mono">UP</span>
          </button>

          <button
            id="btn-input-down"
            onPointerDown={(e) => { e.preventDefault(); onButtonPress('down'); }}
            className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-3 bg-amber-950/80 hover:bg-amber-900 active:bg-amber-500 active:text-black border-2 border-amber-500 rounded text-amber-300 font-pixel text-xs transition duration-75 min-h-[44px] shadow-[0_0_10px_rgba(245,158,11,0.3)] touch-manipulation"
          >
            <span className="text-base sm:text-lg leading-none">▼</span>
            <span className="text-[8px] text-amber-400/80 mt-0.5 font-mono">DOWN</span>
          </button>

          <button
            id="btn-input-right"
            onPointerDown={(e) => { e.preventDefault(); onButtonPress('right'); }}
            className="flex flex-col items-center justify-center py-2 px-2.5 sm:py-2.5 sm:px-3 bg-pink-950/80 hover:bg-pink-900 active:bg-pink-500 active:text-black border-2 border-pink-500 rounded text-pink-300 font-pixel text-xs transition duration-75 min-h-[44px] shadow-[0_0_10px_rgba(236,72,153,0.3)] touch-manipulation"
          >
            <span className="text-base sm:text-lg leading-none">▶</span>
            <span className="text-[8px] text-pink-400/80 mt-0.5 font-mono">RIGHT</span>
          </button>
        </div>

        {/* GIANT SPACEBAR FINISHER BUTTON */}
        <button
          id="btn-input-space"
          onPointerDown={(e) => { e.preventDefault(); onButtonPress('space'); }}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 rounded border-2 font-pixel text-xs transition duration-75 flex flex-col items-center justify-center min-h-[44px] touch-manipulation ${
            finisherApproaching
              ? 'bg-amber-500 text-slate-950 border-amber-300 animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.9)]'
              : 'bg-yellow-950/80 hover:bg-yellow-900 active:bg-yellow-500 active:text-black text-yellow-300 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold tracking-wider">★ SPACEBAR FINISHER ★</span>
          </div>
          <span className="text-[7.5px] sm:text-[8px] opacity-80 mt-0.5 font-mono">PRESS SPACE TO CLOSE LOOP COMBO</span>
        </button>

      </div>
    </div>
  );
};
