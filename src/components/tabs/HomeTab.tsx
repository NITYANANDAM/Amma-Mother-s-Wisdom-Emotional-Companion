import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Coffee,
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  ArrowRight,
  Flame,
  Search,
  RefreshCw,
  Soup,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyReminder, DailyBlessingData } from '../../types';
import { speakMaternalVoice, stopMaternalVoice, isSpeakingVoice } from '../../utils/audio';

interface HomeTabProps {
  profile: UserProfile;
  reminders: DailyReminder[];
  onToggleReminder: (id: string) => void;
  onNavigateToChatWithPrompt: (prompt: string, searchGrounding?: boolean, deepThinking?: boolean) => void;
  onNavigateToDilemma: () => void;
  onOpenHug: (feeling?: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  reminders,
  onToggleReminder,
  onNavigateToChatWithPrompt,
  onNavigateToDilemma,
  onOpenHug,
}) => {
  const [greeting, setGreeting] = useState<string>('Good morning');
  const [blessingData, setBlessingData] = useState<DailyBlessingData | null>(null);
  const [isLoadingBlessing, setIsLoadingBlessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Time-based maternal greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else if (hour < 21) setGreeting('Good evening');
    else setGreeting('Quiet night');
  }, []);

  // Fetch or load daily blessing
  const fetchDailyBlessing = async (force = false) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const cached = localStorage.getItem('amma_daily_blessing_cache');
    if (!force && cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.dateKey === todayKey) {
          setBlessingData(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }

    setIsLoadingBlessing(true);
    try {
      const res = await fetch('/api/daily-blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: profile }),
      });
      if (res.ok) {
        const data = await res.json();
        const payload: DailyBlessingData = { ...data, dateKey: todayKey };
        setBlessingData(payload);
        localStorage.setItem('amma_daily_blessing_cache', JSON.stringify(payload));
      }
    } catch (err) {
      console.error('Failed to load blessing:', err);
    } finally {
      setIsLoadingBlessing(false);
    }
  };

  useEffect(() => {
    fetchDailyBlessing();
  }, [profile.tone, profile.preferredCallingName]);

  const handleReadBlessing = () => {
    if (isSpeaking) {
      stopMaternalVoice();
      setIsSpeaking(false);
      return;
    }
    if (!blessingData) return;
    const speechText = `${blessingData.blessing} Amma's wellness tip for you: ${blessingData.wellnessTip}. Affirm with me: ${blessingData.affirmation}`;
    setIsSpeaking(true);
    speakMaternalVoice(
      speechText,
      () => setIsSpeaking(false),
      profile.voicePitch,
      profile.voiceRate
    );
  };

  const handleCompleteReminder = (id: string, completed: boolean) => {
    onToggleReminder(id);
    if (!completed) {
      // Confetti burst for taking care of yourself!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#f59e0b', '#10b981', '#fbbf24'],
      });
    }
  };

  const moods = [
    { label: 'Peaceful', emoji: '🌿', feeling: 'I feel quiet and peaceful today' },
    { label: 'Anxious', emoji: '🥺', feeling: 'I am feeling quite anxious and worried' },
    { label: 'Exhausted', emoji: '🥱', feeling: 'I am totally exhausted and running on empty' },
    { label: 'Proud', emoji: '🌟', feeling: 'I accomplished something and wanted to share my joy' },
    { label: 'Heavy Heart', emoji: '🌧️', feeling: 'My heart feels heavy and I need some comfort' },
    { label: 'Confused', emoji: '🧭', feeling: 'I am stuck at a life crossroads and need wisdom' },
  ];

  const recipeOfTheDay = {
    title: 'Amma\'s Golden Turmeric & Cinnamon Elixir',
    desc: 'Warms your chest, eases mental tension, and calms tired nerves before rest.',
    tip: 'Simmer warm milk (dairy or almond) with a pinch of turmeric, crushed black pepper, honey, and cinnamon stick.',
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-6">
      {/* Warm Maternal Hero Greeting */}
      <div className="bg-gradient-to-br from-[#FFF5EC] via-[#FFF9F3] to-[#FCEEE2] rounded-3xl p-5 border border-amber-900/10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider">
            {greeting.includes('morning') ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : greeting.includes('night') ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Coffee className="w-4 h-4 text-amber-600" />
            )}
            <span>{greeting}</span>
          </div>

          <span className="text-[11px] font-medium text-stone-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-stone-200">
            Today is a fresh page
          </span>
        </div>

        <h2 className="font-serif-warm text-2xl font-bold text-stone-900 leading-snug">
          How are you feeling, {profile.preferredCallingName || 'Beta'}?
        </h2>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          Amma was just thinking of you. Did you drink a glass of water yet? Remember, nothing in this world is more important than your health and peace of mind.
        </p>

        {/* Mood Selector Pills */}
        <div className="mt-4 pt-3 border-t border-amber-900/10">
          <p className="text-[11px] font-medium text-stone-500 mb-2">
            Tell me in one tap:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => {
                  setSelectedMood(m.label);
                  if (m.label === 'Heavy Heart' || m.label === 'Anxious' || m.label === 'Exhausted') {
                    onOpenHug(m.feeling);
                  } else if (m.label === 'Confused') {
                    onNavigateToDilemma();
                  } else {
                    onNavigateToChatWithPrompt(`Amma, ${m.feeling}. Just wanted to check in with you.`);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all text-left ${
                  selectedMood === m.label
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-white/80 hover:bg-white text-stone-700 border-amber-900/10 hover:border-amber-900/20 shadow-xs'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Blessing & Motherly Care Card */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Sparkles className="w-3.5 h-3.5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-serif-warm text-sm font-bold text-stone-900">
                Daily Blessing &amp; Care
              </h3>
              <p className="text-[10px] text-stone-500">From Amma's heart to yours</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchDailyBlessing(true)}
              disabled={isLoadingBlessing}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title="Refresh today's blessing"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBlessing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleReadBlessing}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
              title="Hear Amma read this blessing"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Listening...' : 'Hear Voice'}</span>
            </button>
          </div>
        </div>

        {isLoadingBlessing && !blessingData ? (
          <div className="py-6 flex flex-col items-center justify-center text-xs text-stone-400 gap-2">
            <Heart className="w-5 h-5 text-rose-400 animate-pulse" />
            <span>Writing a warm blessing for you...</span>
          </div>
        ) : blessingData ? (
          <div className="space-y-3">
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-amber-900/5">
              <p className="text-xs text-stone-800 leading-relaxed italic">
                "{blessingData.blessing}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50">
                <span className="font-semibold text-amber-900 block text-[11px] mb-0.5">
                  🥣 Nourishment Tip:
                </span>
                <p className="text-stone-700 text-[11px] leading-tight">
                  {blessingData.wellnessTip}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/50">
                <span className="font-semibold text-emerald-900 block text-[11px] mb-0.5">
                  🌿 Motherly Affirmation:
                </span>
                <p className="text-stone-700 text-[11px] leading-tight font-medium">
                  "{blessingData.affirmation}"
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-400 italic font-serif-warm">
                — {blessingData.tagline || 'Always with you, Amma'}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Maternal Daily Reminders Quick Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif-warm text-sm font-bold text-stone-900">
              Did you take care of this today?
            </h3>
            <p className="text-[10px] text-stone-500">Maternal check-ins for your wellbeing</p>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {reminders.filter((r) => r.completed).length} / {reminders.length} Done
          </span>
        </div>

        <div className="space-y-2">
          {reminders.slice(0, 4).map((rem) => (
            <div
              key={rem.id}
              onClick={() => handleCompleteReminder(rem.id, rem.completed)}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                rem.completed
                  ? 'bg-stone-50 border-stone-200 opacity-60'
                  : 'bg-[#FCFAF7] hover:bg-white border-amber-900/10 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-stone-400 hover:text-emerald-500 transition"
                >
                  {rem.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                  )}
                </button>
                <div>
                  <h4
                    className={`text-xs font-semibold ${
                      rem.completed ? 'line-through text-stone-400' : 'text-stone-800'
                    }`}
                  >
                    {rem.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {rem.motherlyNote}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-stone-400 font-medium shrink-0 ml-2">
                {rem.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Amma's Deep Wisdom & Dilemma Helper Spotlight */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
          <Sparkles className="w-36 h-36" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-300">
            High-Level Thinking Engine
          </span>
        </div>

        <h3 className="font-serif-warm text-base font-bold mb-1">
          Torn between two life choices?
        </h3>
        <p className="text-xs text-stone-300 mb-4 leading-relaxed">
          Job switch, relationship conflict, or personal dilemma? Amma's deep reasoning will weigh heart, mind, and the 5-year perspective with you.
        </p>

        <button
          onClick={onNavigateToDilemma}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow transition active:scale-95"
        >
          <span>Weigh My Dilemma</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Wisdom Kitchen Recipe / Home Remedy */}
      <div className="bg-[#FAF4EB] rounded-3xl p-5 border border-amber-900/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Soup className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif-warm text-sm font-bold text-stone-900">
              Amma's Comfort Cup
            </h3>
          </div>
          <button
            onClick={() =>
              onNavigateToChatWithPrompt(
                'Amma, can you search Google for the best natural home remedies and soothing herbal teas for stress, low energy, and restful sleep?',
                true,
                false
              )
            }
            className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
          >
            <Search className="w-3 h-3" />
            <span>Search Remedies</span>
          </button>
        </div>

        <h4 className="text-xs font-bold text-stone-800 mb-1">
          {recipeOfTheDay.title}
        </h4>
        <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
          {recipeOfTheDay.desc}
        </p>
        <div className="p-2.5 bg-white/80 rounded-xl text-[11px] text-amber-900 border border-amber-200/50">
          <span className="font-semibold">Preparation: </span>
          {recipeOfTheDay.tip}
        </div>
      </div>
    </div>
  );
};
