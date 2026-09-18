import { useEffect, useRef, useCallback } from 'react';
import { PixelRenderer } from '../canvas/pixelRenderer';
import { audioSynth } from '../audio/synthEngine';
import {
  GameNote,
  NoteType,
  FloatingText,
  Particle,
  SlashEffect,
  GameStats,
  CharacterClass,
  BotBugConfig,
  DifficultyConfig,
  ItemDropType,
} from '../types';
import { getMultiplier } from '../data/gameData';

interface GameCanvasProps {
  playerClass: CharacterClass;
  botConfig: BotBugConfig;
  difficulty: DifficultyConfig;
  stats: GameStats;
  onUpdateStats: (newStats: Partial<GameStats>) => void;
  onGameOver: (won: boolean) => void;
  isPaused: boolean;
  onGlitchStateChange: (active: boolean) => void;
  onFreezeStateChange: (active: boolean) => void;
  onAutoSpaceChange: (active: boolean) => void;
  onFinisherApproachingChange: (approaching: boolean) => void;
  inputTrigger: NoteType | null;
  onInputHandled: () => void;
}

export const GameCanvas = ({
  playerClass,
  botConfig,
  difficulty,
  stats,
  onUpdateStats,
  onGameOver,
  isPaused,
  onGlitchStateChange,
  onFreezeStateChange,
  onAutoSpaceChange,
  onFinisherApproachingChange,
  inputTrigger,
  onInputHandled,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PixelRenderer | null>(null);

  // Mutable game state in refs for high-frequency 60fps RAF loop
  const stateRef = useRef({
    startTime: 0,
    currentTimeMs: 0,
    notes: [] as GameNote[],
    floatingTexts: [] as FloatingText[],
    particles: [] as Particle[],
    slashes: [] as SlashEffect[],
    nextNoteTimeMs: 1000,
    noteCounter: 0,
    loopIndex: 0,
    notesInCurrentLoop: 0,

    // Animations
    playerAnim: 'idle' as 'idle' | 'attack' | 'finisher' | 'hit',
    playerAnimTimer: 0,
    botAnim: 'idle' as 'idle' | 'attack' | 'glitch' | 'hit',
    botAnimTimer: 0,

    // Screen effects
    screenShake: 0,
    isGlitchActive: false,
    glitchTimer: 0,
    nextGlitchCheckTime: 4000,

    // Powerup states
    isFrozen: false,
    freezeTimer: 0,
    autoSpaceArmed: false,

    // Stats sync
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfectCount: 0,
    greatCount: 0,
    missCount: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    playerHp: playerClass.baseHp,
    playerMaxHp: playerClass.baseHp,
    botHp: difficulty.targetScore,
    botMaxHp: difficulty.targetScore,
    shieldsRemaining: playerClass.shieldMisses,
    isEnded: false,
  });

  // Spawn notes procedural sequencer
  const spawnNotes = useCallback((nowMs: number) => {
    const s = stateRef.current;
    const msPerBeat = 60000 / difficulty.bpm;
    const lookAheadMs = 4500;

    while (s.nextNoteTimeMs < nowMs + lookAheadMs) {
      s.noteCounter++;
      s.notesInCurrentLoop++;

      const isFinisher = s.notesInCurrentLoop >= difficulty.notesPerLoop + 1;
      let type: NoteType;

      if (isFinisher) {
        type = 'space';
        s.notesInCurrentLoop = 0;
        s.loopIndex++;
      } else {
        const types: NoteType[] = ['left', 'up', 'down', 'right'];
        // Pick random direction
        type = types[Math.floor(Math.random() * types.length)];
      }

      s.notes.push({
        id: s.noteCounter,
        type,
        timeMs: s.nextNoteTimeMs,
        loopIndex: s.loopIndex,
        isFinisher,
        hit: false,
      });

      // Reduced spacing between notes in the set (closer, fast rhythmic flow)
      // Small pause after finisher to mark the completion of the 10-20 note combo set
      if (isFinisher) {
        s.nextNoteTimeMs += msPerBeat * 1.1;
      } else {
        s.nextNoteTimeMs += msPerBeat * 0.48;
      }
    }
  }, [difficulty]);

  // Spawn floating feedback text
  const addFloatingText = (
    text: string,
    color: string,
    x = 140,
    y = 350,
    scale = 1.0,
    rating?: 'PERFECT' | 'GREAT' | 'MISS',
    isDamage?: boolean
  ) => {
    stateRef.current.floatingTexts.push({
      id: Math.random(),
      text,
      rating,
      x,
      y,
      color,
      life: 45,
      maxLife: 45,
      scale,
      isDamage,
    });
  };

  // Spawn pixel explosion particles
  const addPixelParticles = (x: number, y: number, color: string, count = 16, shape: 'pixel' | 'spark' | 'binary' = 'pixel') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 5 + 3,
        color,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        shape,
        char: Math.random() > 0.5 ? '0' : '1',
      });
    }
  };

  // Process input hit check
  const handleNoteInput = useCallback((inputKey: NoteType) => {
    const s = stateRef.current;
    if (s.isEnded || isPaused) return;

    audioSynth.init();
    const now = s.currentTimeMs;

    // Find first unhit note
    const candidateNotes = s.notes.filter(n => !n.hit && !n.missed);
    if (candidateNotes.length === 0) return;

    // Nearest note in time
    const target = candidateNotes[0];
    const diff = Math.abs(now - target.timeMs);

    // If within Great window and type matches
    if (diff <= difficulty.greatWindowMs) {
      if (target.type === inputKey) {
        // HIT SUCCESS!
        target.hit = true;
        const isPerfect = diff <= difficulty.perfectWindowMs;
        target.hitRating = isPerfect ? 'PERFECT' : 'GREAT';

        s.combo++;
        if (s.combo > s.maxCombo) s.maxCombo = s.combo;
        s.multiplier = getMultiplier(s.combo);

        // Milestone callout when reaching combo requirements (10 and 20 notes)
        if (s.combo === 10) {
          audioSynth.playPowerupSfx();
          addFloatingText('⚡ 10 HITS! COMBO ACTIVATED (x2)! ⚡', '#00f0ff', 180, 270, 1.35, 'PERFECT');
          addPixelParticles(180, 270, '#00f0ff', 18, 'spark');
        } else if (s.combo === 20) {
          audioSynth.playPowerupSfx();
          addFloatingText('🔥 20 HITS! MEGA COMBO (x3)! 🔥', '#f59e0b', 180, 270, 1.45, 'PERFECT');
          addPixelParticles(180, 270, '#fbbf24', 24, 'spark');
        } else if (s.combo === 30) {
          audioSynth.playPowerupSfx();
          addFloatingText('💥 30 HITS! HYPER OVERCLOCK (x4)! 💥', '#ec4899', 180, 270, 1.5, 'PERFECT');
          addPixelParticles(180, 270, '#f472b6', 30, 'spark');
        }

        // Base points & rebalanced damage (gentler base, combo & class multiplier preserved)
        const baseScore = isPerfect ? 500 : 350;
        const points = Math.round(baseScore * s.multiplier * playerClass.scoreBonus);
        s.score += points;

        // Balanced base damage
        const baseDamage = target.isFinisher ? 45 : (isPerfect ? 20 : 12);
        const damageDealt = Math.round(baseDamage * s.multiplier * playerClass.scoreBonus);
        s.totalDamageDealt += damageDealt;

        // Player Lifesteal perk (Debugger Paladin)
        if (isPerfect && playerClass.lifeStealPerPerfect > 0) {
          s.playerHp = Math.min(s.playerMaxHp, s.playerHp + playerClass.lifeStealPerPerfect);
          addFloatingText(`+${playerClass.lifeStealPerPerfect} HP`, '#34d399', 180, 220, 0.9);
        }

        // Spawn Attack Slash & Trajectory Line
        s.slashes.push({
          id: Math.random(),
          startX: 180,
          startY: 215,
          endX: 625,
          endY: 210,
          color: target.isFinisher ? '#facc15' : (isPerfect ? playerClass.primaryColor : '#38bdf8'),
          life: target.isFinisher ? 24 : 18,
          maxLife: target.isFinisher ? 24 : 18,
          isFinisher: target.isFinisher,
          angle: (Math.random() - 0.5) * 0.8,
          width: target.isFinisher ? 12 : 5,
        });

        // Spawn Floating Damage Number above enemy
        addFloatingText(
          `-${damageDealt} DMG`,
          target.isFinisher ? '#facc15' : (isPerfect ? '#22d3ee' : '#a7f3d0'),
          625,
          155,
          target.isFinisher ? 1.3 : 1.05,
          undefined,
          true
        );

        // Animation triggers
        if (target.isFinisher) {
          s.playerAnim = 'finisher';
          s.playerAnimTimer = 35;
          s.botAnim = 'hit';
          s.botAnimTimer = 30;
          s.screenShake = 12;

          audioSynth.playFinisherSfx();
          addPixelParticles(625, 210, '#fbbf24', 28);
          addPixelParticles(625, 210, playerClass.primaryColor, 20);
          addFloatingText(`CRITICAL FINISHER! +${points}`, '#facc15', 200, 320, 1.3, 'PERFECT');

          // ITEM DROP MECHANIC: When combo >= 20 (x3 multiplier), 30% chance for special cyber item!
          if (s.combo >= 20 && Math.random() < 0.3) {
            triggerRandomItemDrop();
          }
        } else {
          s.playerAnim = 'attack';
          s.playerAnimTimer = 16;
          s.botAnim = 'hit';
          s.botAnimTimer = 14;
          s.screenShake = 4;

          audioSynth.playHitSfx(isPerfect);
          addPixelParticles(625, 210, isPerfect ? playerClass.primaryColor : '#e2e8f0', 12);
          addFloatingText(
            isPerfect ? `PERFECT! +${points}` : `GREAT! +${points}`,
            isPerfect ? '#22d3ee' : '#a7f3d0',
            160,
            335,
            isPerfect ? 1.1 : 0.95,
            isPerfect ? 'PERFECT' : 'GREAT'
          );
        }

        if (isPerfect) s.perfectCount++;
        else s.greatCount++;

        // Win check (Progress >= 100%)
        if (s.score >= difficulty.targetScore) {
          s.isEnded = true;
          audioSynth.stopMusic();
          audioSynth.playVictorySfx();
          addPixelParticles(625, 210, '#f43f5e', 45, 'spark');
          setTimeout(() => onGameOver(true), 1200);
        }

      } else {
        // Wrong key pressed within hit window -> MISS!
        handleMiss('WRONG KEY!');
      }
    } else if (diff <= 140) {
      // Pressed too early or late -> MISS!
      handleMiss('OFF BEAT!');
    }
  }, [playerClass, difficulty, isPaused, onGameOver]);

  // Random cyber item drop trigger (Freeze, Heal, or AutoSpace)
  const triggerRandomItemDrop = () => {
    const s = stateRef.current;
    const items: ItemDropType[] = ['FREEZE', 'HEAL', 'AUTOSPACE'];
    const chosen = items[Math.floor(Math.random() * items.length)];

    audioSynth.playPowerupSfx();

    if (chosen === 'FREEZE') {
      s.isFrozen = true;
      s.freezeTimer = 240; // 4 seconds at 60fps
      onFreezeStateChange(true);
      addFloatingText('❄ ITEM: NOTE FREEZE 4s! ❄', '#38bdf8', 260, 280, 1.2);
    } else if (chosen === 'HEAL') {
      const healAmount = 25;
      s.playerHp = Math.min(s.playerMaxHp, s.playerHp + healAmount);
      addPixelParticles(160, 220, '#10b981', 20);
      addFloatingText(`🧪 ITEM: +${healAmount} HP RECOVERY!`, '#34d399', 260, 280, 1.2);
    } else if (chosen === 'AUTOSPACE') {
      s.autoSpaceArmed = true;
      onAutoSpaceChange(true);
      addFloatingText('⚡ ITEM: AUTO-SPACE FINISHER ARMED! ⚡', '#facc15', 260, 280, 1.2);
    }
  };

  // Handle Miss logic
  const handleMiss = (reason = 'MISS!') => {
    const s = stateRef.current;

    // Check Buffer Shield perk
    if (s.shieldsRemaining > 0) {
      s.shieldsRemaining--;
      audioSynth.playMissSfx();
      addFloatingText(`SHIELD BLOCKED MISS! (${s.shieldsRemaining} LEFT)`, '#c084fc', 220, 320, 1.0);
      return;
    }

    s.combo = 0;
    s.multiplier = 1;
    s.missCount++;

    // Incoming damage calculation with class reduction (balanced rawDamage: 5 instead of 12)
    const rawDamage = 5;
    const dmg = Math.max(1, Math.round(rawDamage * (1 - playerClass.damageReduction)));
    s.playerHp = Math.max(0, s.playerHp - dmg);
    s.totalDamageTaken += dmg;

    s.playerAnim = 'hit';
    s.playerAnimTimer = 20;
    s.botAnim = 'attack';
    s.botAnimTimer = 20;
    s.screenShake = 6;

    audioSynth.playMissSfx();
    addPixelParticles(150, 220, '#ef4444', 16);
    addFloatingText(reason, '#ef4444', 150, 335, 1.0, 'MISS');
    addFloatingText(`-${dmg} HP`, '#f43f5e', 150, 160, 1.15, undefined, true);

    // Player Death Check
    if (s.playerHp <= 0) {
      s.isEnded = true;
      audioSynth.stopMusic();
      audioSynth.playMissSfx();
      setTimeout(() => onGameOver(false), 1200);
    }
  };

  // React to input trigger from HUD virtual buttons
  useEffect(() => {
    if (inputTrigger) {
      handleNoteInput(inputTrigger);
      onInputHandled();
    }
  }, [inputTrigger, handleNoteInput, onInputHandled]);

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || stateRef.current.isEnded) return;

      const key = e.key.toLowerCase();
      let input: NoteType | null = null;

      if (e.key === 'ArrowLeft' || key === 'a') input = 'left';
      else if (e.key === 'ArrowUp' || key === 'w') input = 'up';
      else if (e.key === 'ArrowDown' || key === 's') input = 'down';
      else if (e.key === 'ArrowRight' || key === 'd') input = 'right';
      else if (e.code === 'Space' || key === ' ') {
        e.preventDefault();
        input = 'space';
      }

      if (input) {
        handleNoteInput(input);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, handleNoteInput]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new PixelRenderer(ctx);
    rendererRef.current.setDimensions(canvas.width, canvas.height);

    const s = stateRef.current;
    s.startTime = performance.now();
    s.playerMaxHp = playerClass.baseHp;
    s.playerHp = playerClass.baseHp;
    s.botMaxHp = difficulty.targetScore;
    s.botHp = difficulty.targetScore;
    s.shieldsRemaining = playerClass.shieldMisses;
    s.isEnded = false;

    // Start background rhythm synthesis
    audioSynth.startMusic(difficulty.bpm);

    let animationFrameId: number;
    let lastStatsSync = 0;

    const gameLoop = (timestamp: number) => {
      if (!isPaused && !s.isEnded) {
        s.currentTimeMs = timestamp - s.startTime;
        const now = s.currentTimeMs;

        // 1. Spawning notes
        spawnNotes(now);

        // 2. Check Auto-Hit Spacebar item
        if (s.autoSpaceArmed) {
          const firstNote = s.notes.find(n => !n.hit && !n.missed);
          if (firstNote && firstNote.isFinisher && Math.abs(now - firstNote.timeMs) <= difficulty.perfectWindowMs) {
            s.autoSpaceArmed = false;
            onAutoSpaceChange(false);
            handleNoteInput('space');
          }
        }

        // 3. Check for Finisher approaching receptor within 600ms
        const upcomingFinisher = s.notes.find(n => !n.hit && !n.missed && n.isFinisher && n.timeMs - now < 600 && n.timeMs - now > -40);
        onFinisherApproachingChange(!!upcomingFinisher);

        // 4. Check for missed notes that passed beyond the Great window
        for (const note of s.notes) {
          if (!note.hit && !note.missed && now - note.timeMs > difficulty.greatWindowMs + 20) {
            note.missed = true;
            handleMiss('LATE MISS!');
          }
        }

        // Garbage collect old notes
        s.notes = s.notes.filter(n => now - n.timeMs < 1200);

        // 5. Bot Special Bug Attacks (Glitch Attack / Speed Up)
        if (now > s.nextGlitchCheckTime && !s.isGlitchActive) {
          if (Math.random() < difficulty.bugGlitchFreq) {
            s.isGlitchActive = true;
            s.glitchTimer = 160; // ~2.6 seconds
            s.botAnim = 'glitch';
            s.botAnimTimer = 160;
            audioSynth.playGlitchAttackSfx();
            onGlitchStateChange(true);
            addFloatingText(`⚠️ BUG ATTACK: ${botConfig.specialMoveName}!`, '#ef4444', 350, 160, 1.1);
          }
          s.nextGlitchCheckTime = now + 5000 + Math.random() * 4000;
        }

        if (s.isGlitchActive) {
          s.glitchTimer--;
          if (s.glitchTimer <= 0) {
            s.isGlitchActive = false;
            onGlitchStateChange(false);
            if (s.botAnim === 'glitch') s.botAnim = 'idle';
          }
        }

        // 6. Freeze buff countdown
        if (s.isFrozen) {
          s.freezeTimer--;
          if (s.freezeTimer <= 0) {
            s.isFrozen = false;
            onFreezeStateChange(false);
          }
        }

        // 7. Update animation timers
        if (s.playerAnimTimer > 0) {
          s.playerAnimTimer--;
          if (s.playerAnimTimer <= 0) s.playerAnim = 'idle';
        }
        if (s.botAnimTimer > 0) {
          s.botAnimTimer--;
          if (s.botAnimTimer <= 0) s.botAnim = 'idle';
        }

        // 8. Update floating text physics
        for (const ft of s.floatingTexts) {
          ft.y -= 0.8;
          ft.life--;
        }
        s.floatingTexts = s.floatingTexts.filter(ft => ft.life > 0);

        // 9. Update particles physics
        for (const p of s.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.life--;
        }
        s.particles = s.particles.filter(p => p.life > 0);

        // 9.5 Update slash effects
        for (const sl of s.slashes) {
          sl.life--;
        }
        s.slashes = s.slashes.filter(sl => sl.life > 0);

        // 10. Screen shake decay
        if (s.screenShake > 0) s.screenShake *= 0.88;
        if (s.screenShake < 0.2) s.screenShake = 0;

        // 11. Sync stats back to React state every 60ms
        if (timestamp - lastStatsSync > 60) {
          onUpdateStats({
            score: s.score,
            combo: s.combo,
            maxCombo: s.maxCombo,
            multiplier: s.multiplier,
            perfectCount: s.perfectCount,
            greatCount: s.greatCount,
            missCount: s.missCount,
            totalDamageDealt: s.totalDamageDealt,
            totalDamageTaken: s.totalDamageTaken,
            playerHp: s.playerHp,
            playerMaxHp: s.playerMaxHp,
            botHp: Math.max(0, difficulty.targetScore - s.score),
            botMaxHp: difficulty.targetScore,
            shieldsRemaining: s.shieldsRemaining,
            elapsedTimeMs: s.currentTimeMs,
          });
          lastStatsSync = timestamp;
        }
      }

      // ==========================================
      // RENDER FRAME
      // ==========================================
      const renderer = rendererRef.current;
      if (renderer) {
        ctx.save();
        renderer.applyScreenShake(s.screenShake);

        const hyperMode = s.multiplier >= 4;
        renderer.renderBackground(s.currentTimeMs, s.isGlitchActive, hyperMode);

        // Render Player (Left side)
        renderer.renderPlayer(150, 220, s.playerAnim, s.currentTimeMs, playerClass);

        // Render Bug Boss (Right side)
        renderer.renderBot(630, 210, s.botAnim, s.currentTimeMs, botConfig);

        // Render Rhythm Scroll Board / Highway
        renderer.renderRhythmHighway(
          s.notes,
          s.currentTimeMs,
          difficulty.noteSpeed,
          s.isGlitchActive,
          s.isFrozen
        );

        // Render Attack Slash Trajectories & Blade Slices
        renderer.renderSlashEffects(s.slashes);

        // Render Particle sparks
        renderer.renderParticles(s.particles);

        // Render Floating texts
        renderer.renderFloatingTexts(s.floatingTexts);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioSynth.stopMusic();
    };
  }, [
    difficulty,
    playerClass,
    botConfig,
    isPaused,
    spawnNotes,
    handleNoteInput,
    onGameOver,
    onGlitchStateChange,
    onFreezeStateChange,
    onAutoSpaceChange,
    onFinisherApproachingChange,
    onUpdateStats,
  ]);

  return (
    <div id="game-canvas-wrapper" className="relative w-full aspect-[800/480] max-h-[68vh] flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        id="syntax-strike-canvas"
        ref={canvasRef}
        width={800}
        height={480}
        className="w-full h-full object-contain cursor-crosshair block shadow-2xl"
      />
      {/* Retro CRT Scanline Overlay */}
      <div className="absolute inset-0 crt-overlay pointer-events-none opacity-60" />
    </div>
  );
};
