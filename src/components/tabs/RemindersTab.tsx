import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Droplets,
  Utensils,
  Moon,
  Footprints,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyReminder, UserProfile } from '../../types';

interface RemindersTabProps {
  profile: UserProfile;
  reminders: DailyReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: DailyReminder) => void;
  onDeleteReminder: (id: string) => void;
  onResetAllReminders: () => void;
}

export const RemindersTab: React.FC<RemindersTabProps> = ({
  profile,
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onResetAllReminders,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('03:00 PM');
  const [newCategory, setNewCategory] = useState<'nutrition' | 'hydration' | 'rest' | 'peace' | 'custom'>('custom');
  const [newNote, setNewNote] = useState<string>('');

  const completedCount = reminders.filter((r) => r.completed).length;
  const progressPercent = reminders.length > 0 ? Math.round((completedCount / reminders.length) * 100) : 0;

  const handleToggle = (id: string, currentCompleted: boolean) => {
    onToggleReminder(id);
    if (!currentCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#f59e0b', '#10b981'],
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const reminder: DailyReminder = {
      id: 'rem-' + Date.now(),
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      motherlyNote: newNote.trim() || `Remember, ${profile.preferredCallingName || 'Beta'}, you matter. Take care of yourself.`,
      completed: false,
    };

    onAddReminder(reminder);
    setNewTitle('');
    setNewNote('');
    setShowAddForm(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'hydration':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'nutrition':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'rest':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'peace':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
      {/* Maternal Care Progress Banner */}
      <div className="bg-gradient-to-br from-[#FFF5EC] to-[#FCEEE2] rounded-3xl p-5 border border-amber-900/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <CheckCircle2 className="w-4 h-4 fill-rose-500 text-white" />
            </div>
            <div>
              <h2 className="font-serif-warm text-base font-bold text-stone-900">
                Daily Maternal Care
              </h2>
              <p className="text-[10px] text-stone-500">
                Nurturing habits for {profile.preferredCallingName || 'you'}
              </p>
            </div>
          </div>

          <button
            onClick={onResetAllReminders}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-stone-800 bg-white/70 px-2.5 py-1 rounded-full border border-stone-200 transition"
            title="Reset checkmarks for a new day"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Day</span>
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-stone-700">Today's Self-Care Score</span>
            <span className="font-bold text-rose-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <p className="text-xs text-stone-600 italic">
          {progressPercent === 100
            ? `Amma's heart is full! You completed all your care rituals today. I am so proud of you, ${profile.preferredCallingName}!`
            : progressPercent >= 50
            ? `Good progress, my child! Keep tending to your body and soul. Almost there.`
            : `Don't rush through your day without looking after yourself, ${profile.preferredCallingName}. Take small caring steps.`}
        </p>
      </div>

      {/* Reminder List Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif-warm text-sm font-bold text-stone-900">
          Caring Reminders &amp; Rituals
        </h3>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Add Reminder Modal/Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white rounded-2xl p-4 border border-amber-300 shadow-sm space-y-3 animate-in fade-in"
        >
          <h4 className="text-xs font-bold text-stone-900">
            Create a New Care Reminder
          </h4>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Ritual Name *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="E.g., Take evening vitamins, call sibling..."
              className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Time
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="03:00 PM"
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="nutrition">Nutrition / Meal</option>
                <option value="hydration">Hydration / Water</option>
                <option value="rest">Sleep / Rest</option>
                <option value="peace">Walk / Peace</option>
                <option value="custom">General Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Amma's Loving Words for this
            </label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="E.g., Don't forget your vitamins, beta. They keep your energy strong."
              className="w-full bg-[#FAF7F2] border border-stone-200 focus:border-rose-400 rounded-xl p-2.5 text-xs outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Save Ritual
            </button>
          </div>
        </form>
      )}

      {/* Reminder Cards */}
      <div className="space-y-2.5">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              rem.completed
                ? 'bg-stone-50/70 border-stone-200 opacity-60'
                : 'bg-white hover:border-amber-300 border-amber-900/10 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(rem.id, rem.completed)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-500 transition"
                >
                  {rem.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#FAF7F2]">
                      {getCategoryIcon(rem.category)}
                    </span>
                    <h4
                      className={`text-xs font-bold ${
                        rem.completed ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {rem.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed italic bg-[#FAF7F2] px-2.5 py-1.5 rounded-xl border border-stone-200/50">
                    "{rem.motherlyNote}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {rem.time}
                </span>

                {!rem.isDefault && (
                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="text-stone-300 hover:text-rose-500 p-1 transition"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
