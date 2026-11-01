import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Wifi, Battery, Volume2, VolumeX } from 'lucide-react';
import { stopMaternalVoice } from '../utils/audio';

interface MobileFrameProps {
  children: React.ReactNode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  openKeepsakes: () => void;
  keepsakesCount: number;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  soundEnabled,
  onToggleSound,
  openKeepsakes,
  keepsakesCount,
}) => {
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-900/95 flex flex-col items-center justify-center p-0 md:p-4 text-stone-800 transition-colors duration-300">
      {/* Top Floating Utility Bar (visible on md screens) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-3 py-1.5 bg-stone-800/80 backdrop-blur rounded-full text-stone-300 text-xs shadow-md border border-stone-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-stone-200">Amma Companion</span>
          <span className="text-stone-400">| Warmth &amp; Wisdom</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (soundEnabled) stopMaternalVoice();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute voice/sound' : 'Unmute voice/sound'}
            className="p-1 hover:text-white rounded transition"
          >
            {soundEnabled ? <Volume2 size={14} className="text-amber-300" /> : <VolumeX size={14} className="text-stone-400" />}
          </button>
          <button
            onClick={openKeepsakes}
            className="relative px-2 py-0.5 rounded bg-stone-700 hover:bg-stone-600 text-amber-200 text-xs transition"
          >
            Keepsakes
            {keepsakesCount > 0 && (
              <span className="ml-1 px-1 bg-amber-600 text-[10px] rounded-full text-white">
                {keepsakesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsFrameMode(!isFrameMode)}
            className="p-1 hover:text-white rounded transition flex items-center gap-1 text-[11px]"
            title={isFrameMode ? 'Expand view' : 'Phone mockup view'}
          >
            {isFrameMode ? <Maximize2 size={13} /> : <Smartphone size={13} />}
            <span>{isFrameMode ? 'Expand' : 'Phone'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: either smartphone mockup or fluid wide canvas */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          isFrameMode
            ? 'max-w-[420px] h-[100dvh] md:h-[860px] md:max-h-[92vh] md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1c1917,0_0_0_14px_#44403c] border-0'
            : 'max-w-2xl h-[100dvh] md:h-[90vh] md:rounded-3xl md:shadow-2xl border border-stone-700/30'
        } bg-[#FAF7F2]`}
      >
        {/* Mobile Status Bar (iOS / Android Style) */}
        <div className="shrink-0 h-10 px-6 flex items-center justify-between text-xs font-semibold text-stone-700 select-none z-30 pt-1">
          <div className="w-14 font-medium tracking-tight">{currentTime}</div>
          {/* Dynamic Island / Speaker Pill */}
          <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-800"></span>
          </div>
          <div className="w-14 flex items-center justify-end gap-1.5 text-stone-600">
            <Wifi size={13} />
            <Battery size={15} className="text-stone-700" />
          </div>
        </div>

        {/* Inner App Content Screen */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Virtual Home Indicator Bar on phone frame */}
        {isFrameMode && (
          <div className="h-4 shrink-0 flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-stone-400/50 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
