/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { StartMenu } from './components/StartMenu';
import { GameCanvas } from './components/GameCanvas';
import { CombatHUD, CombatControls } from './components/CombatHUD';
import { SummaryModal } from './components/SummaryModal';
import { CHARACTER_CLASSES, DIFFICULTIES, BUGS } from './data/gameData';
import {
  CharacterClass,
  DifficultyConfig,
  BotBugConfig,
  GameStats,
  GameScreen,
  NoteType,
} from './types';
import { audioSynth } from './audio/synthEngine';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(CHARACTER_CLASSES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyConfig>(DIFFICULTIES[0]);
  const [selectedBug, setSelectedBug] = useState<BotBugConfig>(BUGS[0]);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    targetScore: DIFFICULTIES[0].targetScore,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfectCount: 0,
    greatCount: 0,
    missCount: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    elapsedTimeMs: 0,
    playerHp: CHARACTER_CLASSES[0].baseHp,
    playerMaxHp: CHARACTER_CLASSES[0].baseHp,
    botHp: DIFFICULTIES[0].targetScore,
    botMaxHp: DIFFICULTIES[0].targetScore,
    shieldsRemaining: CHARACTER_CLASSES[0].shieldMisses,
  });

  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [autoSpaceActive, setAutoSpaceActive] = useState(false);
  const [finisherApproaching, setFinisherApproaching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [won, setWon] = useState(false);
  const [inputTrigger, setInputTrigger] = useState<NoteType | null>(null);

  // Toggle audio mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Toggle pause
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Start new game run
  const handleStartGame = useCallback(() => {
    setStats({
      score: 0,
      targetScore: selectedDifficulty.targetScore,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      perfectCount: 0,
      greatCount: 0,
      missCount: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      elapsedTimeMs: 0,
      playerHp: selectedClass.baseHp,
      playerMaxHp: selectedClass.baseHp,
      botHp: selectedDifficulty.targetScore,
      botMaxHp: selectedDifficulty.targetScore,
      shieldsRemaining: selectedClass.shieldMisses,
    });
    setIsGlitchActive(false);
    setIsFrozen(false);
    setAutoSpaceActive(false);
    setFinisherApproaching(false);
    setIsPaused(false);
    setScreen('PLAYING');
  }, [selectedClass, selectedDifficulty]);

  // Handle game over (Win / Defeat)
  const handleGameOver = useCallback((isWin: boolean) => {
    setWon(isWin);
    setScreen('SUMMARY');
  }, []);

  // Update real-time stats from RAF loop
  const handleUpdateStats = useCallback((newStats: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...newStats }));
  }, []);

  // Virtual button push handler
  const handleVirtualButton = useCallback((type: NoteType) => {
    setInputTrigger(type);
  }, []);

  const handleInputHandled = useCallback(() => {
    setInputTrigger(null);
  }, []);

  return (
    <main id="app-root" className="min-h-screen bg-[#080914] text-slate-100 flex flex-col justify-center items-center select-none overflow-x-hidden">
      {screen === 'MENU' && (
        <div className="w-full">
          <StartMenu
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={(diff) => {
              setSelectedDifficulty(diff);
              setStats((prev) => ({
                ...prev,
                targetScore: diff.targetScore,
                botMaxHp: diff.targetScore,
                botHp: diff.targetScore,
              }));
            }}
            selectedBug={selectedBug}
            onSelectBug={setSelectedBug}
            onStartGame={handleStartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </div>
      )}

      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <div className="w-full max-w-5xl mx-auto flex flex-col justify-between h-[100dvh] max-h-[100dvh] relative p-1 sm:p-2 overflow-hidden">
          {/* Top Combat HUD */}
          <CombatHUD
            stats={stats}
            playerClass={selectedClass}
            botConfig={selectedBug}
            isGlitchActive={isGlitchActive}
            isFrozen={isFrozen}
            autoSpaceActive={autoSpaceActive}
            isMuted={isMuted}
            isPaused={isPaused}
            onToggleMute={handleToggleMute}
            onTogglePause={handleTogglePause}
          />

          {/* Center 2D Pixel Canvas Game Screen */}
          <div className="flex-1 min-h-0 flex items-center justify-center my-1 relative border-2 border-slate-800 rounded-lg overflow-hidden bg-black shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <GameCanvas
              playerClass={selectedClass}
              botConfig={selectedBug}
              difficulty={selectedDifficulty}
              stats={stats}
              onUpdateStats={handleUpdateStats}
              onGameOver={handleGameOver}
              isPaused={isPaused}
              onGlitchStateChange={setIsGlitchActive}
              onFreezeStateChange={setIsFrozen}
              onAutoSpaceChange={setAutoSpaceActive}
              onFinisherApproachingChange={setFinisherApproaching}
              inputTrigger={inputTrigger}
              onInputHandled={handleInputHandled}
            />

            {/* PAUSE OVERLAY */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
                <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400">GAME PAUSED</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleTogglePause}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-pixel text-xs text-white rounded shadow-lg transition"
                  >
                    RESUME (เล่นต่อ)
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.stopMusic();
                      setScreen('MENU');
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 font-pixel text-xs text-slate-300 border border-slate-600 rounded transition"
                  >
                    QUIT TO MENU
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controller D-Pad & Finisher Trigger */}
          <CombatControls
            onButtonPress={handleVirtualButton}
            finisherApproaching={finisherApproaching}
          />
        </div>
      )}

      {screen === 'SUMMARY' && (
        <SummaryModal
          won={won}
          stats={stats}
          playerClass={selectedClass}
          botConfig={selectedBug}
          difficulty={selectedDifficulty}
          onPlayAgain={handleStartGame}
          onBackToMenu={() => setScreen('MENU')}
        />
      )}
    </main>
  );
}
