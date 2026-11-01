import React, { useState, useEffect } from 'react';
import {
  Heart,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  Gift,
  CloudRain,
  Flame,
  Bell,
  Music,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ambientSound, speakMaternalVoice, stopMaternalVoice } from '../../utils/audio';

interface CalmCornerTabProps {
  profile: UserProfile;
  initialFeeling?: string;
  activeAmbientSound: string | null;
  onSetAmbientSound: (sound: string | null) => void;
}

export const CalmCornerTab: React.FC<CalmCornerTabProps> = ({
  profile,
  initialFeeling,
  activeAmbientSound,
  onSetAmbientSound,
}) => {
  // Breathing states: 'inhale' (4s) | 'hold' (7s) | 'exhale' (8s) | 'idle'
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCounter, setBreathCounter] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);

  // Comfort note state
  const [comfortNote, setComfortNote] = useState<string | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState<boolean>(false);
  const [isSpeakingNote, setIsSpeakingNote] = useState<boolean>(false);

  // Jar of loving notes
  const [openedJarNote, setOpenedJarNote] = useState<string | null>(null);

  const lovingJarNotes = [
    `You are not a burden, ${profile.preferredCallingName || 'Beta'}. You are a gift to this world, and I am grateful for your existence.`,
    `Rest is not something you have to earn by suffering. Put your worries down for tonight.`,
    `Look how much you have survived already. Your spirit is quiet, but it is unbreakable.`,
    `Eat well, drink water, and be gentle with yourself. You are doing much better than you realize.`,
    `A bad day does not mean a bad life. The storm passes, the earth smells fresh again.`,
    `I believe in you with my whole heart. Always have, always will.`,
  ];

  // Quick comfort triggers
  const comfortTriggers = [
    { label: 'Chest feels tight & anxious', feeling: 'chest tightness and panic' },
    { label: 'Someone broke my heart', feeling: 'grief, heartbreak, and rejection' },
    { label: 'I feel like a failure', feeling: 'imposter syndrome and feeling like a failure' },
    { label: 'Crying alone in my room', feeling: 'loneliness, tears, and exhaustion' },
  ];

  // Handle breathing sequence
  useEffect(() => {
    if (!isBreathingActive) {
      setBreathPhase('idle');
      return;
    }

    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let count = 4;
    setBreathPhase('inhale');
    setBreathCounter(4);

    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          count = 7;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          count = 8;
        } else {
          currentPhase = 'inhale';
          count = 4;
        }
        setBreathPhase(currentPhase);
      }
      setBreathCounter(count);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Request comfort note from backend
  const fetchComfortNote = async (feeling: string) => {
    setIsLoadingNote(true);
    setComfortNote(null);
    try {
      const res = await fetch('/api/comfort-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling, userProfile: profile }),
      });
      if (res.ok) {
        const data = await res.json();
        setComfortNote(data.note);
      }
    } catch {
      setComfortNote(
        `Close your eyes and breathe with me, ${profile.preferredCallingName || 'Beta'}. Put your hand over your heart. You are safe, you are held, and this feeling will pass.`
      );
    } finally {
      setIsLoadingNote(false);
    }
  };

  useEffect(() => {
    if (initialFeeling) {
      fetchComfortNote(initialFeeling);
    }
  }, [initialFeeling]);

  const handleToggleVoice = (text: string) => {
    if (isSpeakingNote) {
      stopMaternalVoice();
      setIsSpeakingNote(false);
    } else {
      setIsSpeakingNote(true);
      speakMaternalVoice(
        text,
        () => setIsSpeakingNote(false),
        profile.voicePitch,
        profile.voiceRate
      );
    }
  };

  const handleToggleAmbient = (type: 'rain' | 'fireplace' | 'chimes' | 'lullaby') => {
    if (activeAmbientSound === type) {
      ambientSound.stop();
      onSetAmbientSound(null);
    } else {
      ambientSound.play(type);
      onSetAmbientSound(type);
    }
  };

  const handlePickRandomNote = () => {
    const random = lovingJarNotes[Math.floor(Math.random() * lovingJarNotes.length)];
    setOpenedJarNote(random);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
      {/* 4-7-8 Breathing Orb & Maternal Hug */}
      <div className="bg-gradient-to-b from-[#FFF5EC] to-[#FAF0E6] rounded-3xl p-6 border border-amber-900/10 text-center shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Amma's 4-7-8 Gentle Breathing Orb</span>
        </div>

        <p className="text-xs text-stone-600 mb-6 max-w-xs mx-auto">
          Synchronize your chest with Amma's rhythm: Inhale peace, hold your strength, and exhale the weight.
        </p>

        {/* Breathing Orb Visualization */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center mb-6">
          {/* Animated pulsing outer rings */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              breathPhase === 'inhale'
                ? 'scale-125 bg-rose-200/50'
                : breathPhase === 'hold'
                ? 'scale-125 bg-amber-200/50'
                : breathPhase === 'exhale'
                ? 'scale-90 bg-stone-200/40'
                : 'scale-100 bg-rose-100/40'
            }`}
          ></div>

          <div
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-inner transition-all duration-700 z-10 ${
              breathPhase === 'inhale'
                ? 'bg-gradient-to-tr from-rose-400 to-amber-300 scale-110 text-white shadow-rose-300/40'
                : breathPhase === 'hold'
                ? 'bg-gradient-to-tr from-amber-400 to-rose-400 scale-110 text-white shadow-amber-300/40'
                : breathPhase === 'exhale'
                ? 'bg-gradient-to-tr from-stone-300 to-amber-200 scale-90 text-stone-800'
                : 'bg-gradient-to-tr from-rose-200 to-amber-100 text-stone-700'
            }`}
          >
            {isBreathingActive ? (
              <>
                <span className="font-serif-warm text-xl font-bold uppercase tracking-wide">
                  {breathPhase}
                </span>
                <span className="text-2xl font-black mt-0.5">{breathCounter}s</span>
              </>
            ) : (
              <>
                <Heart className="w-8 h-8 text-rose-500 fill-rose-400 animate-gentle-pulse" />
                <span className="text-[11px] font-semibold mt-1">Tap to Breathe</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsBreathingActive(!isBreathingActive)}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-sm transition active:scale-95 flex items-center justify-center gap-2 mx-auto ${
            isBreathingActive
              ? 'bg-stone-700 text-white hover:bg-stone-800'
              : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
          }`}
        >
          {isBreathingActive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Pause Breathing</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start 4-7-8 Breathing with Amma</span>
            </>
          )}
        </button>
      </div>

      {/* Emergency Comfort Note Box */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
        <div>
          <h3 className="font-serif-warm text-sm font-bold text-stone-900">
            Emergency Heart Hug
          </h3>
          <p className="text-[11px] text-stone-500">
            Pick what hurts right now, and let Amma speak comfort straight into your heart:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {comfortTriggers.map((trig, i) => (
            <button
              key={i}
              onClick={() => fetchComfortNote(trig.feeling)}
              className="p-2.5 rounded-xl text-left bg-[#FCFAF7] hover:bg-amber-50/80 border border-amber-900/10 text-stone-700 text-xs font-medium transition"
            >
              {trig.label}
            </button>
          ))}
        </div>

        {isLoadingNote && (
          <div className="py-4 text-center text-xs text-rose-600 font-medium flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 animate-bounce text-rose-500" />
            <span>Amma is holding space for you...</span>
          </div>
        )}

        {comfortNote && (
          <div className="p-4 rounded-2xl bg-[#FFF8F2] border border-rose-200/60 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>From Amma</span>
              </span>

              <button
                onClick={() => handleToggleVoice(comfortNote)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-medium transition"
              >
                {isSpeakingNote ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeakingNote ? 'Stop' : 'Listen Voice'}</span>
              </button>
            </div>

            <p className="text-xs text-stone-800 italic leading-relaxed whitespace-pre-wrap">
              "{comfortNote}"
            </p>
          </div>
        )}
      </div>

      {/* Jar of Loving Words */}
      <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-amber-900/10 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="font-serif-warm text-sm font-bold text-stone-900">
          Amma's Jar of Loving Words
        </h3>
        <p className="text-[11px] text-stone-600 mb-3 max-w-xs mx-auto">
          Need a gentle reminder of who you are? Pull a handwritten slip from the jar.
        </p>

        {openedJarNote ? (
          <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm mb-3 animate-in fade-in">
            <p className="text-xs text-stone-800 font-serif-warm italic leading-relaxed">
              "{openedJarNote}"
            </p>
            <button
              onClick={handlePickRandomNote}
              className="mt-3 text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Pick another slip</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handlePickRandomNote}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-stone-700 text-xs font-semibold rounded-xl border border-amber-900/15 shadow-2xs transition"
          >
            Open a Loving Note
          </button>
        )}
      </div>

      {/* Soothing Ambient Sounds (Web Audio API) */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-warm text-sm font-bold text-stone-900">
              Calming Ambient Soundscapes
            </h3>
            <p className="text-[10px] text-stone-500">
              Pure acoustic synthesis to quiet an overactive mind
            </p>
          </div>

          {activeAmbientSound && (
            <button
              onClick={() => handleToggleAmbient(activeAmbientSound as any)}
              className="text-[11px] px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full font-medium"
            >
              Turn Off
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: 'rain', label: 'Gentle Rain', desc: 'Pink noise & drops', icon: CloudRain },
            { id: 'fireplace', label: 'Warm Hearth', desc: 'Crackling fireside', icon: Flame },
            { id: 'chimes', label: 'Wind Chimes', desc: 'Pentatonic bells', icon: Bell },
            { id: 'lullaby', label: '432Hz Drone', desc: 'Harmonic binaural hum', icon: Music },
          ].map((item) => {
            const Icon = item.icon;
            const isPlaying = activeAmbientSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleToggleAmbient(item.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isPlaying
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                    : 'bg-[#FCFAF7] hover:bg-stone-50 border-amber-900/10 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isPlaying ? 'text-emerald-600' : 'text-stone-400'}`} />
                  {isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold leading-tight">{item.label}</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
