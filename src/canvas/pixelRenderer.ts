import { GameNote, FloatingText, Particle, HitRating, CharacterClass, BotBugConfig, SlashEffect } from '../types';

/**
 * 2D Pixel Art Canvas Rendering Engine for "Syntax Strike: Beat the Bug"
 * Features procedural pixel character sprites, glitch bug boss, neon effects, and rhythm scroll board.
 */

export class PixelRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 500;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Clear canvas with cyber server-room matrix backdrop
   */
  public renderBackground(time: number, isGlitchActive: boolean, hyperMode: boolean) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Base background dark gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#060713');
    grad.addColorStop(0.65, '#0c0f24');
    grad.addColorStop(1, '#050610');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Hyper mode neon flash
    if (hyperMode) {
      const pulse = Math.sin(time * 0.01) * 0.15 + 0.15;
      ctx.fillStyle = `rgba(236, 72, 153, ${pulse})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Server rack background silhouettes
    const rackWidth = 50;
    const numRacks = Math.ceil(w / rackWidth);
    for (let i = 0; i < numRacks; i++) {
      const rx = i * rackWidth;
      const ry = 40;
      const rh = 180;
      ctx.fillStyle = i % 2 === 0 ? '#0f132e' : '#0b0e22';
      ctx.fillRect(rx + 4, ry, rackWidth - 8, rh);

      // Blinking server lights
      for (let led = 0; led < 6; led++) {
        const ledY = ry + 15 + led * 26;
        const blink = Math.sin(time * 0.005 + i * 2 + led) > 0.1;
        if (blink) {
          const isError = isGlitchActive && (led % 2 === 0);
          ctx.fillStyle = isError ? '#ef4444' : (led % 3 === 0 ? '#06b6d4' : '#10b981');
          ctx.fillRect(rx + 10, ledY, 4, 4);
          ctx.fillRect(rx + 18, ledY, 8, 4);
        } else {
          ctx.fillStyle = '#1e2444';
          ctx.fillRect(rx + 10, ledY, 4, 4);
          ctx.fillRect(rx + 18, ledY, 8, 4);
        }
      }
    }

    // Cyber perspective grid floor
    const horizonY = 220;
    ctx.strokeStyle = hyperMode ? '#ec4899' : '#06b6d4';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;

    // Horizontal grid lines
    for (let y = horizonY; y <= 350; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Perspective diagonal lines converging to center horizon
    const centerX = w / 2;
    for (let x = -w; x <= w * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(x, 350);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Floating pixel binary code bits in background
    ctx.fillStyle = isGlitchActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.35)';
    ctx.font = '10px "VT323", monospace';
    const binaryStrings = ['01', '10', '{;}', 'null', '0x2F', 'bug()', 'NaN'];
    for (let b = 0; b < 10; b++) {
      const bx = ((b * 93 + time * 0.04) % (w + 60)) - 30;
      const by = 40 + ((b * 37 + time * 0.02) % 170);
      const str = binaryStrings[b % binaryStrings.length];
      ctx.fillText(str, bx, by);
    }
  }

  /**
   * Render 2D Pixel Art Player
   */
  public renderPlayer(
    px: number,
    py: number,
    animState: 'idle' | 'attack' | 'finisher' | 'hit',
    animTime: number,
    playerClass: CharacterClass
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px, py);

    // Pixel scale factor
    const s = 4; // Each pixel is 4x4 on canvas
    const bob = animState === 'idle' ? Math.floor(Math.sin(animTime * 0.008) * 2) * s : 0;
    const isHit = animState === 'hit';

    // Flash white/red if damaged
    if (isHit) {
      ctx.fillStyle = Math.floor(animTime * 0.05) % 2 === 0 ? '#ef4444' : '#ffffff';
    }

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(4 * s, 19 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body offset for action
    const attackOffset = animState === 'attack' ? 4 * s : (animState === 'finisher' ? 2 * s : 0);
    const jumpOffset = animState === 'finisher' ? -6 * s : 0;

    ctx.translate(attackOffset, jumpOffset + bob);

    // Draw procedural pixel warrior
    const pColor = playerClass.primaryColor || '#00f0ff';
    const darkSuit = '#1e1b4b';
    const skinColor = '#fcd34d';
    const visorColor = '#38bdf8';

    // Helper to draw pixel block
    const pixel = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = isHit ? '#ffffff' : color;
      ctx.fillRect(x * s, y * s, w * s, h * s);
    };

    // Legs / Boots
    pixel(-2, 14, 3, 5, '#0f172a');
    pixel(3, 14, 3, 5, '#0f172a');
    pixel(-3, 17, 4, 2, pColor);
    pixel(2, 17, 4, 2, pColor);

    // Torso / Cyber Armor
    pixel(-4, 7, 10, 7, darkSuit);
    pixel(-3, 8, 8, 5, pColor);
    pixel(-1, 9, 4, 3, '#ffffff'); // Energy core chest

    // Cape / Scarf flutter
    const capeFlutter = Math.floor(Math.sin(animTime * 0.01) * 2);
    pixel(-8 + capeFlutter, 8, 4, 9, playerClass.avatarColor);
    pixel(-10 + capeFlutter, 11, 4, 7, playerClass.avatarColor);

    // Head / Cyber Helmet
    pixel(-4, 0, 9, 7, '#0f172a');
    pixel(-3, 1, 7, 5, darkSuit);
    pixel(-2, 3, 6, 2, visorColor); // Glowing visor slit

    // Hair / Cyber Horns
    pixel(-4, -2, 4, 2, pColor);
    pixel(2, -2, 4, 2, pColor);

    // Arms & Weapon based on animation state
    if (animState === 'attack') {
      // Extended slash forward
      pixel(5, 7, 7, 3, darkSuit);
      // Giant neon slash blade horizontal
      pixel(10, 5, 12, 3, '#ffffff');
      pixel(11, 4, 11, 1, pColor);
      pixel(11, 8, 11, 1, pColor);
      // Slash arc effect
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(14 * s, 6 * s, 10 * s, -0.6, 0.6);
      ctx.stroke();
    } else if (animState === 'finisher') {
      // Two-handed overhead massive strike
      pixel(0, -5, 4, 6, darkSuit);
      // Giant vertical beam sword
      pixel(1, -16, 4, 18, '#ffffff');
      pixel(0, -17, 6, 20, pColor);
      // Finisher aura particles
      ctx.fillStyle = '#f59e0b';
      for (let p = 0; p < 4; p++) {
        const pxOff = (Math.sin(animTime * 0.03 + p) * 6) * s;
        ctx.fillRect(pxOff, (-10 - p * 3) * s, 2 * s, 2 * s);
      }
    } else {
      // Idle / Normal stance
      pixel(5, 7, 4, 4, darkSuit);
      pixel(7, 4, 2, 7, '#cbd5e1'); // Sword hilt
      pixel(8, 0, 2, 8, pColor);   // Neon blade resting upright
    }

    ctx.restore();
  }

  /**
   * Render 2D Pixel Art Bot (Bug / Glitch Boss)
   */
  public renderBot(
    bx: number,
    by: number,
    animState: 'idle' | 'attack' | 'glitch' | 'hit',
    animTime: number,
    botConfig: BotBugConfig
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(bx, by);

    const s = 4;
    const isHit = animState === 'hit';
    const isGlitch = animState === 'glitch';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(4 * s, 20 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glitch tearing offset
    const glitchJitterX = isGlitch || isHit ? (Math.random() - 0.5) * 8 * s : 0;
    const glitchJitterY = isGlitch || isHit ? (Math.random() - 0.5) * 4 * s : 0;
    ctx.translate(glitchJitterX, glitchJitterY);

    const mainColor = botConfig.color || '#ef4444';
    const subColor = botConfig.secondaryColor || '#f87171';
    const coreColor = isGlitch ? '#00f0ff' : '#ffffff';

    const pixel = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = isHit ? '#ffffff' : color;
      ctx.fillRect(x * s, y * s, w * s, h * s);
    };

    // Spider / Bug multi-legs
    const legWiggle1 = Math.sin(animTime * 0.01) * 3;
    const legWiggle2 = Math.cos(animTime * 0.01) * 3;

    // Left legs
    pixel(-10, 8 + legWiggle1, 4, 2, '#450a0a');
    pixel(-14, 10 + legWiggle1, 4, 7, mainColor);
    pixel(-8, 12 + legWiggle2, 3, 2, '#450a0a');
    pixel(-12, 14 + legWiggle2, 4, 6, mainColor);

    // Right legs
    pixel(12, 8 + legWiggle2, 4, 2, '#450a0a');
    pixel(16, 10 + legWiggle2, 4, 7, mainColor);
    pixel(10, 12 + legWiggle1, 3, 2, '#450a0a');
    pixel(14, 14 + legWiggle1, 4, 6, mainColor);

    // Main Bug Body Carapace (Segmented thorax)
    pixel(-6, 2, 18, 14, '#1c1917');
    pixel(-4, 4, 14, 10, mainColor);
    pixel(-2, 6, 10, 6, subColor);

    // Glitching Binary Core in center of Bug
    pixel(1, 8, 4, 4, coreColor);
    if (isGlitch) {
      // Glitch tendrils bursting outward
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(3 * s, 10 * s);
        ctx.lineTo((3 + Math.sin(animTime * 0.05 + g) * 15) * s, (10 + Math.cos(animTime * 0.05 + g) * 15) * s);
        ctx.stroke();
      }
    }

    // Bug Head & Mandibles
    pixel(-3, -4, 12, 6, '#292524');
    pixel(-2, -3, 10, 4, mainColor);

    // Pulsing Bug Eyes (Compound cluster)
    const eyeBlink = Math.sin(animTime * 0.006) > -0.7;
    if (eyeBlink) {
      pixel(-1, -2, 2, 2, '#fbbf24');
      pixel(2, -2, 2, 2, '#fbbf24');
      pixel(5, -2, 2, 2, '#fbbf24');
    }

    // Twitching Cyber Antennae
    const antWave = Math.sin(animTime * 0.015) * 2;
    pixel(-4 + antWave, -8, 2, 4, subColor);
    pixel(-6 + antWave, -10, 2, 2, '#ef4444');
    pixel(8 - antWave, -8, 2, 4, subColor);
    pixel(10 - antWave, -10, 2, 2, '#ef4444');

    // Attack Stance: Glitch blast from mouth
    if (animState === 'attack') {
      pixel(-12, -2, 8, 4, '#ef4444');
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-16 * s, -1 * s, 6 * s, 2 * s);
    }

    ctx.restore();
  }

  /**
   * Render Horizontal Rhythm Highway / Scroll Board
   */
  public renderRhythmHighway(
    notes: GameNote[],
    currentTimeMs: number,
    noteSpeed: number, // pixels per second
    isGlitchActive: boolean,
    isFrozen: boolean
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const highwayY = 370;
    const highwayH = 75;
    const targetX = 140; // The strike receptor zone X coordinate

    // Highway background panel
    ctx.fillStyle = isFrozen ? 'rgba(8, 47, 73, 0.92)' : 'rgba(10, 15, 30, 0.9)';
    ctx.fillRect(0, highwayY, w, highwayH);

    // Highway border lanes
    ctx.strokeStyle = isFrozen ? '#38bdf8' : (isGlitchActive ? '#ef4444' : '#06b6d4');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, highwayY);
    ctx.lineTo(w, highwayY);
    ctx.moveTo(0, highwayY + highwayH);
    ctx.lineTo(w, highwayY + highwayH);
    ctx.stroke();

    // Subtle guide line along center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, highwayY + highwayH / 2);
    ctx.lineTo(w, highwayY + highwayH / 2);
    ctx.stroke();

    // STRIKE RECEPTOR ZONE (Where notes align)
    const receptorSize = 52;
    const recY = highwayY + (highwayH - receptorSize) / 2;

    // Outer glow for receptor
    ctx.fillStyle = isGlitchActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)';
    ctx.fillRect(targetX - receptorSize / 2, recY, receptorSize, receptorSize);

    ctx.strokeStyle = isGlitchActive ? '#ef4444' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(targetX - receptorSize / 2, recY, receptorSize, receptorSize);

    // Receptor corner pixel brackets
    const bLen = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(targetX - receptorSize / 2 - 2, recY - 2, bLen, 3);
    ctx.fillRect(targetX - receptorSize / 2 - 2, recY - 2, 3, bLen);
    ctx.fillRect(targetX + receptorSize / 2 - bLen + 2, recY - 2, bLen, 3);
    ctx.fillRect(targetX + receptorSize / 2 - 1, recY - 2, 3, bLen);
    ctx.fillRect(targetX - receptorSize / 2 - 2, recY + receptorSize - 1, bLen, 3);
    ctx.fillRect(targetX - receptorSize / 2 - 2, recY + receptorSize - bLen + 2, 3, bLen);
    ctx.fillRect(targetX + receptorSize / 2 - bLen + 2, recY + receptorSize - 1, bLen, 3);
    ctx.fillRect(targetX + receptorSize / 2 - 1, recY + receptorSize - bLen + 2, 3, bLen);

    // "HIT HERE" label below receptor
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRIKE', targetX, highwayY + highwayH - 6);

    // Freeze effect indicator
    if (isFrozen) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('❄ FREEZE TIME ❄', targetX + 110, highwayY + 16);
    }

    // DRAW INCOMING NOTES
    // Notes move from right to left toward targetX
    const visibleNotes = notes.filter(n => !n.hit && !n.missed);

    for (const note of visibleNotes) {
      const timeDiffMs = note.timeMs - currentTimeMs;
      // Effective speed: slowed down if frozen
      const effectiveSpeed = isFrozen ? noteSpeed * 0.65 : noteSpeed;
      const x = targetX + (timeDiffMs / 1000) * effectiveSpeed;

      // Only draw if on screen
      if (x < -60 || x > w + 60) continue;

      this.renderNoteItem(x, highwayY + highwayH / 2 - 2, note, isGlitchActive);
    }
  }

  /**
   * Render individual Note (Arrow glyph or Spacebar Finisher)
   */
  private renderNoteItem(cx: number, cy: number, note: GameNote, isGlitchActive: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    if (note.isFinisher) {
      // SPACEBAR FINISHER TOKEN (Golden glowing large pill)
      const pw = 74;
      const ph = 42;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(-pw / 2 - 4, -ph / 2 - 4, pw + 8, ph + 8);

      ctx.fillStyle = '#eab308';
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-pw / 2 + 3, -ph / 2 + 3, pw - 6, ph - 6);

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);

      // Spacebar Icon / Label
      ctx.fillStyle = '#713f12';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPACE', 0, -2);

      // Mini "LOOP HIT" tag
      ctx.fillStyle = '#b45309';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('HIT', 0, 11);

      ctx.restore();
      return;
    }

    // Standard Directional Arrow Note
    const size = 46;
    let bgColor = '#06b6d4';
    let borderColor = '#22d3ee';
    let glyph = '◀';

    switch (note.type) {
      case 'left':
        bgColor = '#06b6d4';
        borderColor = '#67e8f9';
        glyph = '◀';
        break;
      case 'up':
        bgColor = '#10b981';
        borderColor = '#6ee7b7';
        glyph = '▲';
        break;
      case 'down':
        bgColor = '#f59e0b';
        borderColor = '#fcd34d';
        glyph = '▼';
        break;
      case 'right':
        bgColor = '#ec4899';
        borderColor = '#f472b6';
        glyph = '▶';
        break;
    }

    // Bug Glitch obfuscation: occasionally scramble glyph
    if (isGlitchActive) {
      bgColor = '#ef4444';
      borderColor = '#fca5a5';
      const corruptGlyphs = ['?', '@', '#', '!', 'X', 'Ø'];
      glyph = corruptGlyphs[note.id % corruptGlyphs.length];
    }

    // Outer glow square
    ctx.fillStyle = `${bgColor}40`;
    ctx.fillRect(-size / 2 - 3, -size / 2 - 3, size + 6, size + 6);

    // Main note body
    ctx.fillStyle = bgColor;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Inner highlight border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4);

    // Render Large Crisp Arrow Inside
    if (isGlitchActive) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, 0, 2);
    } else {
      ctx.save();
      // Drop shadow for arrow symbol
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();

      // Bold, large geometric arrow polygon filling ~70% of the box
      if (note.type === 'left') {
        ctx.moveTo(-15, 0);
        ctx.lineTo(-1, -13);
        ctx.lineTo(-1, -6);
        ctx.lineTo(14, -6);
        ctx.lineTo(14, 6);
        ctx.lineTo(-1, 6);
        ctx.lineTo(-1, 13);
        ctx.closePath();
      } else if (note.type === 'right') {
        ctx.moveTo(15, 0);
        ctx.lineTo(1, -13);
        ctx.lineTo(1, -6);
        ctx.lineTo(-14, -6);
        ctx.lineTo(-14, 6);
        ctx.lineTo(1, 6);
        ctx.lineTo(1, 13);
        ctx.closePath();
      } else if (note.type === 'up') {
        ctx.moveTo(0, -15);
        ctx.lineTo(13, -1);
        ctx.lineTo(6, -1);
        ctx.lineTo(6, 14);
        ctx.lineTo(-6, 14);
        ctx.lineTo(-6, -1);
        ctx.lineTo(-13, -1);
        ctx.closePath();
      } else if (note.type === 'down') {
        ctx.moveTo(0, 15);
        ctx.lineTo(13, 1);
        ctx.lineTo(6, 1);
        ctx.lineTo(6, -14);
        ctx.lineTo(-6, -14);
        ctx.lineTo(-6, 1);
        ctx.lineTo(-13, 1);
        ctx.closePath();
      }

      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Render Attack Slashes, Weapon Trails & Energy Trajectories
   */
  public renderSlashEffects(slashes: SlashEffect[]) {
    const ctx = this.ctx;
    for (const slash of slashes) {
      const alpha = Math.max(0, slash.life / slash.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (slash.isFinisher) {
        // GIANT FINISHER BEAM & CROSS-SLASH
        // 1. High-energy beam trajectory from player to enemy
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 14 * alpha;
        ctx.beginPath();
        ctx.moveTo(slash.startX, slash.startY);
        ctx.lineTo(slash.endX, slash.endY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4 * alpha;
        ctx.beginPath();
        ctx.moveTo(slash.startX, slash.startY);
        ctx.lineTo(slash.endX, slash.endY);
        ctx.stroke();

        // 2. Cross Slash Cut at the enemy impact point
        ctx.save();
        ctx.translate(slash.endX, slash.endY);

        // Expanding shockwave ring
        const ringRadius = (1 - alpha) * 45 + 15;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Diagonal Slash 1
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-50, -40);
        ctx.lineTo(50, 40);
        ctx.stroke();

        // Outer glow
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(-50, -40);
        ctx.lineTo(50, 40);
        ctx.stroke();

        // Diagonal Slash 2
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-50, 40);
        ctx.lineTo(50, -40);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(-50, 40);
        ctx.lineTo(50, -40);
        ctx.stroke();

        ctx.restore();
      } else {
        // REGULAR SWORD SLASH & ATTACK TRAJECTORY LINE
        // 1. Neon trajectory streak from blade to bot
        ctx.strokeStyle = slash.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.moveTo(slash.startX, slash.startY);
        ctx.lineTo(slash.endX, slash.endY);
        ctx.stroke();

        // 2. Dynamic Slash Arc / Blade Trail on the enemy
        ctx.save();
        ctx.translate(slash.endX, slash.endY);
        ctx.rotate(slash.angle);

        // Blade Slash Arc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 36, -0.7, 0.7);
        ctx.stroke();

        ctx.strokeStyle = slash.color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 36, -0.7, 0.7);
        ctx.stroke();

        // Impact spark star
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -3, 6, 6);
        ctx.fillRect(-8, -1, 16, 2);
        ctx.fillRect(-1, -8, 2, 16);

        ctx.restore();
      }

      ctx.restore();
    }
  }

  /**
   * Render Floating Judgments & Damage Numbers ("PERFECT!", "-42 DMG", "MISS!", etc.)
   */
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    for (const item of texts) {
      const alpha = Math.max(0, item.life / item.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(item.x, item.y);
      ctx.scale(item.scale, item.scale);

      if (item.isDamage) {
        // ENHANCED FLOATING DAMAGE NUMBERS
        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        // Outer glow / background badge for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        const textMetrics = ctx.measureText(item.text);
        const tw = textMetrics.width + 12;
        ctx.fillRect(-tw / 2, -14, tw, 20);
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-tw / 2, -14, tw, 20);

        // Text fill
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, 0, 1);
      } else {
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        // Drop shadow
        ctx.fillStyle = '#000000';
        ctx.fillText(item.text, 2, 2);

        // Text color
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, 0, 0);
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render Particle Effects (Pixel debris, spark bursts, binary crumbs)
   */
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.shape === 'binary' && p.char) {
        ctx.fillStyle = p.color;
        ctx.font = '10px "VT323", monospace';
        ctx.fillText(p.char, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Screen Shake wrapper
   */
  public applyScreenShake(shakeIntensity: number) {
    if (shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * shakeIntensity;
      const dy = (Math.random() - 0.5) * shakeIntensity;
      this.ctx.translate(dx, dy);
    }
  }
}
