import React, { useState } from 'react';
import {
  User,
  Heart,
  Volume2,
  Sparkles,
  Save,
  Check,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, PersonaTone } from '../../types';
import { speakMaternalVoice, stopMaternalVoice } from '../../utils/audio';

interface SettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);

  const personas: { id: PersonaTone; title: string; subtitle: string; icon: string }[] = [
    {
      id: 'mother',
      title: "Mother's Tender Love",
      subtitle: 'Checks on your meals, sleep, hydration, and protects your peace unconditionally.',
      icon: '🤱',
    },
    {
      id: 'welwisher',
      title: 'Unconditional Well-Wisher',
      subtitle: 'Your biggest cheerleader and loyal confidante who always believes in you.',
      icon: '🌻',
    },
    {
      id: 'elder_sister',
      title: 'Wise Elder Sister (Didi)',
      subtitle: 'Relatable, practical, street-smart, and honest life guidance.',
      icon: '👭',
    },
    {
      id: 'wise_grandma',
      title: 'Serene Grandmother (Dadi/Nani)',
      subtitle: 'Timeless perspective, deep patience, and gentle calming stories.',
      icon: '👵',
    },
  ];

  const callingOptions = [
    'Beta',
    'My Child',
    'Meri Jaan',
    'Darling',
    'Sweetheart',
    formData.name || 'Friend',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestVoice = () => {
    stopMaternalVoice();
    setIsTestingVoice(true);
    const testMessage = `Hello ${formData.preferredCallingName || 'Beta'}, Amma is right here with you. Whatever you are going through, you never have to walk alone.`;
    speakMaternalVoice(
      testMessage,
      () => setIsTestingVoice(false),
      formData.voicePitch,
      formData.voiceRate
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-br from-[#FFF5EC] to-[#FCEEE2] rounded-3xl p-5 border border-amber-900/10 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <h2 className="font-serif-warm text-base font-bold text-stone-900">
              Personalize Amma's Heart
            </h2>
            <p className="text-[10px] text-stone-500">
              Customize the tone, nickname, and context for your companion
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Name & Nickname */}
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
          <h3 className="font-serif-warm text-xs font-bold text-stone-900 uppercase tracking-wider text-rose-800">
            1. Your Name &amp; Motherly Nickname
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Your Real Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g., Alex, Priya, David"
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                What Amma calls you affectionately:
              </label>
              <input
                type="text"
                value={formData.preferredCallingName}
                onChange={(e) =>
                  setFormData({ ...formData, preferredCallingName: e.target.value })
                }
                placeholder="Beta, My child, etc."
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-500 block mb-1.5 font-medium">
              Quick choices:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {callingOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredCallingName: opt })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                    formData.preferredCallingName === opt
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[#FAF7F2] text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Persona Archetype */}
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
          <h3 className="font-serif-warm text-xs font-bold text-stone-900 uppercase tracking-wider text-rose-800">
            2. Choose Amma's Persona Voice
          </h3>

          <div className="space-y-2">
            {personas.map((p) => {
              const isSelected = formData.tone === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setFormData({ ...formData, tone: p.id })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFF8F2] border-rose-400 shadow-xs'
                      : 'bg-[#FAF7F2] hover:bg-stone-50 border-stone-200/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        {p.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Life Background Notes */}
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
          <h3 className="font-serif-warm text-xs font-bold text-stone-900 uppercase tracking-wider text-rose-800">
            3. About Your Life Right Now
          </h3>
          <p className="text-[11px] text-stone-500">
            Help Amma give deeply contextual advice (e.g., student, preparing for exams, working away from home, balancing career &amp; family):
          </p>
          <textarea
            value={formData.backgroundNotes}
            onChange={(e) => setFormData({ ...formData, backgroundNotes: e.target.value })}
            rows={3}
            placeholder="Tell Amma what season of life you're in..."
            className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-3 text-xs outline-none"
          />
        </div>

        {/* Voice & Speech Controls */}
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-warm text-xs font-bold text-stone-900 uppercase tracking-wider text-rose-800">
                4. Voice &amp; Speech Tone
              </h3>
              <p className="text-[10px] text-stone-500">
                Adjust Amma's comforting maternal cadence
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isTestingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Pitch: {formData.voicePitch.toFixed(2)} (Gentle warmth)
              </label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={formData.voicePitch}
                onChange={(e) =>
                  setFormData({ ...formData, voicePitch: parseFloat(e.target.value) })
                }
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Pacing: {formData.voiceRate.toFixed(2)} (Calm speed)
              </label>
              <input
                type="range"
                min="0.75"
                max="1.15"
                step="0.05"
                value={formData.voiceRate}
                onChange={(e) =>
                  setFormData({ ...formData, voiceRate: parseFloat(e.target.value) })
                }
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Saved with Love!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Personalization</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
