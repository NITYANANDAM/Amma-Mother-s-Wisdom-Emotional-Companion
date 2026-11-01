import React, { useState } from 'react';
import {
  Scale,
  Brain,
  Sparkles,
  ArrowRight,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Check,
  History,
  Trash2,
} from 'lucide-react';
import { UserProfile, DilemmaResult } from '../../types';
import { speakMaternalVoice, stopMaternalVoice } from '../../utils/audio';

interface DilemmaTabProps {
  profile: UserProfile;
  dilemmas: DilemmaResult[];
  onSaveDilemma: (result: DilemmaResult) => void;
  onDeleteDilemma: (id: string) => void;
}

export const DilemmaTab: React.FC<DilemmaTabProps> = ({
  profile,
  dilemmas,
  onSaveDilemma,
  onDeleteDilemma,
}) => {
  const [dilemmaText, setDilemmaText] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [fears, setFears] = useState<string>('');
  const [coreValues, setCoreValues] = useState<string>('Inner peace & self-respect');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DilemmaResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const presets = [
    {
      title: 'Career Crossroads',
      dilemma: 'Should I stay in my secure job or take a risky but exciting opportunity?',
      a: 'Stay in the secure job for stability',
      b: 'Take the new risky opportunity',
      fears: 'Failing, regretting losing safety, judgment from family',
    },
    {
      title: 'Family vs Personal Dream',
      dilemma: 'My parents want me to follow one path, but my heart yearns for another.',
      a: 'Comply with family wishes to keep harmony',
      b: 'Stand my ground and pursue my personal passion',
      fears: 'Hurting people I love, feeling isolated, guilt',
    },
    {
      title: 'Confrontation or Silence',
      dilemma: 'A close person said or did something that hurt me deeply.',
      a: 'Confront them honestly about my boundaries',
      b: 'Stay quiet and swallow my feelings to avoid drama',
      fears: 'Ruining the relationship, being seen as dramatic',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setDilemmaText(p.dilemma);
    setOptionA(p.a);
    setOptionB(p.b);
    setFears(p.fears);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemmaText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const res = await fetch('/api/analyze-dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma: dilemmaText,
          optionA,
          optionB,
          fears,
          coreValues,
          userProfile: profile,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      const newResult: DilemmaResult = {
        id: 'dil-' + Date.now(),
        dilemma: dilemmaText,
        optionA,
        optionB,
        fears,
        analysis: data.analysis,
        timestamp: Date.now(),
      };

      setCurrentAnalysis(newResult);
      onSaveDilemma(newResult);
    } catch (err: any) {
      console.error('Dilemma analysis failed', err);
      alert('Amma could not connect to deep thought right now. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!currentAnalysis) return;
    navigator.clipboard.writeText(currentAnalysis.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopMaternalVoice();
      setIsSpeaking(false);
    } else if (currentAnalysis) {
      setIsSpeaking(true);
      speakMaternalVoice(
        currentAnalysis.analysis,
        () => setIsSpeaking(false),
        profile.voicePitch,
        profile.voiceRate
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                Deep Maternal Reasoning
              </span>
              <h2 className="font-serif-warm text-lg font-bold">
                The Dilemma Weighing Scale
              </h2>
            </div>
          </div>

          {dilemmas.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 transition"
            >
              <History className="w-3.5 h-3.5" />
              <span>{showHistory ? 'New Dilemma' : `Past (${dilemmas.length})`}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          When life presents tough forks in the road, let Amma untangle the knot with high-level wisdom, weighing fear against growth and peace.
        </p>
      </div>

      {showHistory ? (
        /* History View */
        <div className="space-y-3">
          <h3 className="font-serif-warm text-sm font-bold text-stone-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-700" />
            <span>Past Dilemmas &amp; Amma's Guidance</span>
          </h3>

          {dilemmas.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-xs text-stone-400">
              No saved dilemmas yet.
            </div>
          ) : (
            dilemmas.map((dil) => (
              <div
                key={dil.id}
                className="bg-white rounded-2xl p-4 border border-amber-900/10 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-900">
                    "{dil.dilemma}"
                  </h4>
                  <button
                    onClick={() => onDeleteDilemma(dil.id)}
                    className="text-stone-400 hover:text-rose-600 transition p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-stone-600 whitespace-pre-wrap max-h-36 overflow-y-auto bg-[#FAF7F2] p-3 rounded-xl border border-stone-200/50">
                  {dil.analysis}
                </div>
                <button
                  onClick={() => {
                    setCurrentAnalysis(dil);
                    setShowHistory(false);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                >
                  <span>View full reflection</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Form View */
        <>
          {/* Quick Presets */}
          <div>
            <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
              Common crossroads you might relate to:
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-amber-900/10 text-stone-700 text-xs font-medium hover:bg-amber-50 hover:border-amber-300 transition"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                1. What is weighing heavily on your mind? *
              </label>
              <textarea
                value={dilemmaText}
                onChange={(e) => setDilemmaText(e.target.value)}
                placeholder="E.g., I was offered a promotion that requires 60-hour workweeks, but my health and relationship are already stretched thin..."
                rows={3}
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-amber-500 rounded-2xl p-3 text-xs text-stone-800 outline-none placeholder-stone-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Path / Option A
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="E.g., Accept the role"
                  className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Path / Option B
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="E.g., Decline or negotiate balance"
                  className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                What fear or consequence haunts you most?
              </label>
              <input
                type="text"
                value={fears}
                onChange={(e) => setFears(e.target.value)}
                placeholder="E.g., That I will miss my career window, or burn out completely"
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                What does your heart value most right now?
              </label>
              <select
                value={coreValues}
                onChange={(e) => setCoreValues(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-800 outline-none"
              >
                <option value="Inner peace & mental health">Inner peace & mental health</option>
                <option value="Courage & personal growth">Courage & personal growth</option>
                <option value="Family harmony & relationships">Family harmony & relationships</option>
                <option value="Financial independence & security">Financial independence & security</option>
                <option value="Living authentically without regrets">Living authentically without regrets</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !dilemmaText.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-rose-500 to-amber-700 text-white font-semibold text-xs rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 transition active:scale-98 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Amma is reflecting deeply on this dilemma...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ask Amma's Deep Wisdom</span>
                </>
              )}
            </button>
          </form>
        </>
      )}

      {/* Analysis Output Result Card */}
      {currentAnalysis && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <h3 className="font-serif-warm text-sm font-bold text-stone-900">
                  Amma's Tailored Guidance
                </h3>
                <span className="text-[10px] text-amber-700 font-medium">
                  Weighed with love, caution, and long-term perspective
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleVoice}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                title="Hear Amma read this analysis"
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                title="Copy guidance"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-900/10 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
            {currentAnalysis.analysis}
          </div>

          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200/50 flex items-center gap-2.5 text-xs text-rose-900">
            <Heart className="w-4 h-4 shrink-0 text-rose-500 fill-rose-400" />
            <p className="text-[11px] leading-tight">
              Remember, {profile.preferredCallingName || 'Beta'}, whatever you decide, your worth never decreases. Amma is proud of you regardless.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
