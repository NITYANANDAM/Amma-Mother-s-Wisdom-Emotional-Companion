import React from 'react';
import { Heart, Sparkles, Bookmark, Waves } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onOpenHug: () => void;
  onOpenKeepsakes: () => void;
  keepsakesCount: number;
  activeAmbientSound: string | null;
  onStopAmbientSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenHug,
  onOpenKeepsakes,
  keepsakesCount,
  activeAmbientSound,
  onStopAmbientSound,
}) => {
  const toneLabels: Record<string, string> = {
    mother: "Mother's Heart",
    welwisher: "True Well-Wisher",
    elder_sister: "Elder Sister (Didi)",
    wise_grandma: "Wise Grandmother",
  };

  return (
    <header className="px-5 py-2.5 bg-gradient-to-b from-[#F7EFE6] to-[#FAF7F2] border-b border-amber-900/5 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Avatar & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-rose-900/10 flex items-center justify-center animate-gentle-pulse">
            <div className="w-full h-full bg-[#FFF9F3] rounded-[14px] flex items-center justify-center text-rose-600">
              <Heart className="w-5 h-5 fill-rose-500/20 text-rose-600 stroke-[2.2]" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif-warm text-lg font-bold text-stone-900 tracking-tight leading-tight">
              Amma
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
              {toneLabels[profile.tone] || "Mother's Heart"}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>Here for {profile.preferredCallingName || 'you'}, always</span>
          </p>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Active Ambient Sound Badge */}
        {activeAmbientSound && (
          <button
            onClick={onStopAmbientSound}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium animate-pulse border border-emerald-200"
            title="Click to stop soothing ambient sound"
          >
            <Waves className="w-3 h-3" />
            <span className="capitalize">{activeAmbientSound}</span>
          </button>
        )}

        {/* Keepsake Box Button */}
        <button
          onClick={onOpenKeepsakes}
          className="relative p-2 rounded-xl text-stone-600 hover:text-amber-700 hover:bg-amber-100/60 active:scale-95 transition"
          title="Mother's Keepsake Box"
        >
          <Bookmark className="w-4 h-4" />
          {keepsakesCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {keepsakesCount}
            </span>
          )}
        </button>

        {/* Instant Hug & Breathe Button */}
        <button
          onClick={onOpenHug}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold shadow-sm hover:shadow-rose-400/20 active:scale-95 transition"
          title="Need a comforting hug or breath right now"
        >
          <Heart className="w-3.5 h-3.5 fill-white text-white" />
          <span>Warm Hug</span>
        </button>
      </div>
    </header>
  );
};
