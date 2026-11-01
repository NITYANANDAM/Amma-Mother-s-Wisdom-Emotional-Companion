import { UserProfile, DailyReminder, ChatMessage, DilemmaResult } from '../types';

const PROFILE_KEY = 'amma_user_profile_v1';
const REMINDERS_KEY = 'amma_daily_reminders_v1';
const CHAT_KEY = 'amma_chat_messages_v1';
const KEEPSAKES_KEY = 'amma_keepsakes_v1';
const DILEMMAS_KEY = 'amma_dilemmas_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Dear One',
  preferredCallingName: 'Beta',
  tone: 'mother',
  language: 'English',
  backgroundNotes: 'Navigating work, personal growth, and everyday life with high aspirations.',
  soundEnabled: true,
  voicePitch: 1.05,
  voiceRate: 0.92,
};

export const DEFAULT_REMINDERS: DailyReminder[] = [
  {
    id: 'rem-1',
    title: 'Morning Warm Water & Sunlight',
    time: '07:30 AM',
    category: 'hydration',
    motherlyNote: 'Start your day with a tall warm glass of water. Wake your body up gently, beta.',
    completed: false,
    isDefault: true,
  },
  {
    id: 'rem-2',
    title: 'Nourishing Lunch (Don\'t Skip!)',
    time: '01:00 PM',
    category: 'nutrition',
    motherlyNote: 'No matter how busy you are, your health comes first. Eat something fresh and warm.',
    completed: false,
    isDefault: true,
  },
  {
    id: 'rem-3',
    title: 'Afternoon Breath & Water Refill',
    time: '04:00 PM',
    category: 'peace',
    motherlyNote: 'Step away from your screen for 3 minutes. Relax your neck and drink some water.',
    completed: false,
    isDefault: true,
  },
  {
    id: 'rem-4',
    title: 'Evening Walk & Clear Your Head',
    time: '06:30 PM',
    category: 'rest',
    motherlyNote: 'Feel the evening breeze. Let go of whatever happened today, it is in the past.',
    completed: false,
    isDefault: true,
  },
  {
    id: 'rem-5',
    title: 'Peaceful Sleep & Phone Away',
    time: '10:30 PM',
    category: 'rest',
    motherlyNote: 'Tuck yourself in with warmth. Tomorrow is a fresh canvas. Sleep well, my child.',
    completed: false,
    isDefault: true,
  },
];

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadReminders(): DailyReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load reminders', e);
  }
  return DEFAULT_REMINDERS;
}

export function saveReminders(reminders: DailyReminder[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders', e);
  }
}

export function loadChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load chat', e);
  }
  return [
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Namaste meri jaan. I am right here with you. How is your heart feeling today? Have you eaten something nourishing? Tell me whatever is on your mind—no judgment, just love and wisdom.",
      timestamp: Date.now() - 60000,
    },
  ];
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
}

export function loadKeepsakes(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(KEEPSAKES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load keepsakes', e);
  }
  return [];
}

export function saveKeepsakes(keepsakes: ChatMessage[]): void {
  try {
    localStorage.setItem(KEEPSAKES_KEY, JSON.stringify(keepsakes));
  } catch (e) {
    console.error('Failed to save keepsakes', e);
  }
}

export function loadDilemmas(): DilemmaResult[] {
  try {
    const raw = localStorage.getItem(DILEMMAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load dilemmas', e);
  }
  return [];
}

export function saveDilemmas(dilemmas: DilemmaResult[]): void {
  try {
    localStorage.setItem(DILEMMAS_KEY, JSON.stringify(dilemmas));
  } catch (e) {
    console.error('Failed to save dilemmas', e);
  }
}
