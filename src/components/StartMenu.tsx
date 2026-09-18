import { useState, useRef, useEffect } from 'react';
import { Play, Shield, Zap, Sparkles, Crosshair, Volume2, VolumeX, Download, Code, Info, Sliders } from 'lucide-react';
import { CharacterClass, DifficultyConfig, BotBugConfig } from '../types';
import { CHARACTER_CLASSES, DIFFICULTIES, BUGS } from '../data/gameData';
import { audioSynth } from '../audio/synthEngine';
import { generateSingleFileHtml } from '../utils/singleFileExport';

interface StartMenuProps {
  selectedClass: CharacterClass;
  onSelectClass: (c: CharacterClass) => void;
  selectedDifficulty: DifficultyConfig;
  onSelectDifficulty: (d: DifficultyConfig) => void;
  selectedBug: BotBugConfig;
  onSelectBug: (b: BotBugConfig) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartMenu = ({
  selectedClass,
  onSelectClass,
  selectedDifficulty,
  onSelectDifficulty,
  selectedBug,
  onSelectBug,
  onStartGame,
  isMuted,
  onToggleMute,
}: StartMenuProps) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const currentDiffIndex = DIFFICULTIES.findIndex((d) => d.id === selectedDifficulty.id);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    const target = DIFFICULTIES[idx];
    if (target) {
      onSelectDifficulty(target);
      cardRefs.current[target.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleSelectDiff = (diff: DifficultyConfig) => {
    onSelectDifficulty(diff);
  };

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

  const handleCopyCode = () => {
    const htmlContent = generateSingleFileHtml();
    navigator.clipboard.writeText(htmlContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    audioSynth.init();
    audioSynth.playHitSfx(true);
    onStartGame();
  };

  return (
    <div id="start-menu-root" className="min-h-screen bg-[#080914] text-slate-100 flex flex-col justify-between p-2.5 sm:p-5 overflow-y-auto">
      {/* HEADER TITLE */}
      <div className="text-center max-w-4xl mx-auto pt-1 sm:pt-2 pb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
            2D Retro Pixel Art Rhythm Fighting Game
          </span>
        </div>

        <h1 className="font-pixel text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 tracking-wider mb-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          SYNTAX STRIKE
        </h1>
        <p className="font-pixel text-[11px] sm:text-xs text-yellow-400 tracking-widest uppercase">
          ⚔️ BEAT THE BUG ⚔️
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-lg mx-auto px-2">
          เคาะจังหวะตามโค้ด ปราบมอนสเตอร์บั๊กในระบบคอมพิวเตอร์ด้วยคอมโบต่อเนื่อง!
        </p>
      </div>

      {/* MAIN CONFIGURATION GRID - Responsive for Mobile, iPad, PC */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-1 flex-1">
        
        {/* 1. CHARACTER & PERK SELECTOR */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <h2 className="font-pixel text-xs text-cyan-300 uppercase">1. เลือกตัวละคร &amp; สกิล</h2>
            </div>

            <div className="space-y-2">
              {CHARACTER_CLASSES.map((c) => {
                const isSelected = selectedClass.id === c.id;
                return (
                  <button
                    key={c.id}
                    id={`btn-class-${c.id}`}
                    onClick={() => onSelectClass(c)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded border transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.primaryColor }}></span>
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700">
                        {c.baseHp} HP
                      </span>
                    </div>
                    <div className="text-[10.5px] sm:text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                      {c.perkDescriptionTh}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>ตัวคูณคะแนน: x{selectedClass.scoreBonus}</span>
            <span>ฟื้นฟู HP: +{selectedClass.lifeStealPerPerfect}/Hit</span>
          </div>
        </div>

        {/* 2. DIFFICULTY SELECTOR (SCROLLABLE & INTERACTIVE SLIDER UP TO 180 BPM) */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="font-pixel text-xs text-amber-300 uppercase">2. เลือกระดับความยาก</h2>
              </div>
              <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                {selectedDifficulty.bpm} BPM
              </span>
            </div>

            {/* INTERACTIVE BPM SLIDER & STEPPER */}
            <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded border border-slate-800 mb-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                <span className="flex items-center gap-1 font-mono text-amber-400">
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>เลื่อนปรับความเร็ว (50 - 180 BPM):</span>
                </span>
                <span className="font-pixel text-[9px] text-cyan-300 font-bold">
                  {selectedDifficulty.nameTh}
                </span>
              </div>
              <input
                id="difficulty-slider"
                type="range"
                min={0}
                max={DIFFICULTIES.length - 1}
                step={1}
                value={currentDiffIndex >= 0 ? currentDiffIndex : 0}
                onChange={handleSliderChange}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              {/* QUICK BPM CHIPS */}
              <div className="flex items-center justify-between gap-1 mt-1.5 overflow-x-auto pb-0.5">
                {DIFFICULTIES.map((d, i) => {
                  const isCur = selectedDifficulty.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDiff(d)}
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition whitespace-nowrap touch-manipulation ${
                        isCur
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                      title={`${d.nameTh} (${d.bpm} BPM)`}
                    >
                      {d.bpm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SCROLLABLE LIST OF ALL DIFFICULTY CARDS */}
            <div className="max-h-[220px] sm:max-h-[280px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950">
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty.id === d.id;
                return (
                  <button
                    key={d.id}
                    ref={(el) => {
                      cardRefs.current[d.id] = el;
                    }}
                    id={`btn-diff-${d.id}`}
                    onClick={() => handleSelectDiff(d)}
                    className={`w-full text-left p-2.5 rounded border transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-white font-pixel">{d.nameTh}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        {d.bpm} BPM
                      </span>
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                      {d.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[9.5px] sm:text-[10px] font-mono text-slate-400 mt-1.5">
                      <span className="text-cyan-300 font-semibold">🎯 Timing: ±{d.perfectWindowMs}ms / ±{d.greatWindowMs}ms</span>
                      <span className="text-emerald-300">ชุดคอมโบ {d.notesPerLoop} ตัวอักษร + Space Finisher</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-amber-300/80 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>เลื่อนแถบความเร็ว หรือแตะที่การ์ดเพื่อเลือกได้ทันที</span>
          </div>
        </div>

        {/* 3. TARGET BUG BOSS & MECHANICS */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between shadow-lg md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Shield className="w-4 h-4 text-pink-400" />
              <h2 className="font-pixel text-xs text-pink-300 uppercase">3. บอสเป้าหมาย (Bug AI)</h2>
            </div>

            <div className="space-y-2">
              {BUGS.map((b) => {
                const isSelected = selectedBug.id === b.id;
                return (
                  <button
                    key={b.id}
                    id={`btn-bug-${b.id}`}
                    onClick={() => onSelectBug(b)}
                    className={`w-full text-left p-2.5 rounded border transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }}></span>
                        <span>{b.name}</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-rose-300 font-mono mt-0.5">
                      ท่าไม้ตาย: {b.specialMoveTh}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* MECHANICS HIGHLIGHT */}
            <div className="mt-2.5 p-2 sm:p-2.5 bg-slate-950/80 border border-slate-800 rounded text-[10.5px] sm:text-[11px] space-y-1 text-slate-300 leading-relaxed">
              <div className="text-yellow-400 font-bold font-pixel text-[9px] mb-0.5">🎮 กฎ &amp; Timing ({selectedDifficulty.nameTh}):</div>
              <div>• <strong>Perfect (±{selectedDifficulty.perfectWindowMs}ms)</strong>: คะแนนเต็ม + คอมโบต่อเนื่อง</div>
              <div>• <strong>Great (±{selectedDifficulty.greatWindowMs}ms)</strong>: คะแนน 70% + เพิ่มคอมโบ</div>
              <div>• <strong>Miss (&gt;{selectedDifficulty.greatWindowMs}ms / ผิด)</strong>: รีเซ็ตคอมโบ + เสียเลือด</div>
              <div>• <strong>Combo x3 (20+)</strong>: โอกาส 30% สุ่มไอเทม (Freeze / Heal / Auto-Hit)</div>
              <div>• <strong>Combo x4 (30+)</strong>: ไฮเปอร์นีออนแฟลช แสงนีออนเต็มจอ!</div>
            </div>
          </div>

          {/* CONTROLS REMINDER */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>คีย์บอร์ด: [← ↑ ↓ →] / [W A S D] + [SPACE]</span>
            <span className="text-cyan-400 font-bold">หรือกดปุ่มหน้าจอ</span>
          </div>
        </div>

      </div>

      {/* FOOTER ACTION CONTROLS - STICKY AND VISIBLE ON ALL SCREENS */}
      <div className="sticky bottom-0 bg-[#080914]/95 backdrop-blur-md max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 py-2.5 px-2 border-t border-slate-800/80 z-20">
        
        {/* Left Side: Audio and Standalone Exporter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            id="btn-sound-toggle-menu"
            onClick={onToggleMute}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs transition touch-manipulation min-h-[42px]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="whitespace-nowrap">{isMuted ? 'เสียง: ปิด' : 'เสียงเพลง: เปิด'}</span>
          </button>

          <button
            id="btn-open-export-modal"
            onClick={() => setShowExportModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800 rounded text-xs transition touch-manipulation min-h-[42px]"
            title="ดาวน์โหลดหรือดูโค้ดแบบ Single-File HTML"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span className="whitespace-nowrap">Single-file HTML</span>
          </button>
        </div>

        {/* Big Start Battle Button */}
        <button
          id="btn-start-battle"
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 active:scale-95 text-slate-950 font-pixel text-xs sm:text-sm font-bold rounded shadow-[0_0_25px_rgba(6,182,212,0.8)] transition duration-150 flex items-center justify-center gap-2.5 tracking-wider cursor-pointer touch-manipulation min-h-[44px]"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span className="whitespace-nowrap">START BATTLE (เริ่มการต่อสู้)</span>
        </button>

      </div>

      {/* SINGLE-FILE EXPORT POPUP MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-purple-500 rounded-lg max-w-xl w-full p-4 sm:p-5 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                <h3 className="font-pixel text-xs text-purple-300">Single-file HTML Standalone Export</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ไฟล์นี้รวม HTML5 Canvas, CSS และ Web Audio Synthesizer ทั้งหมดอยู่ในไฟล์เดียว สามารถดับเบิ้ลคลิกเปิดบนเว็บเบราว์เซอร์ใดก็ได้โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์หรือไลบรารีภายนอก รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                id="btn-download-file"
                onClick={handleDownloadSingleFile}
                className="w-full sm:flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-pixel text-[10px] rounded flex items-center justify-center gap-2 transition min-h-[42px]"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ .HTML ทันที</span>
              </button>
              <a
                id="btn-open-standalone"
                href="/standalone.html"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-slate-950 font-pixel text-[10px] font-bold rounded flex items-center justify-center gap-1.5 transition text-center min-h-[42px]"
              >
                <span>เปิดเล่น Single-file</span>
              </a>
              <button
                id="btn-copy-code"
                onClick={handleCopyCode}
                className="w-full sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 font-pixel text-[10px] rounded border border-cyan-500/50 flex items-center justify-center gap-1.5 transition min-h-[42px]"
              >
                <span>{copied ? '✓ คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
