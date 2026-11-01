export type PersonaTone = 'mother' | 'welwisher' | 'elder_sister' | 'wise_grandma';

export interface UserProfile {
  name: string;
  preferredCallingName: string;
  tone: PersonaTone;
  language: string;
  backgroundNotes: string;
  soundEnabled: boolean;
  voicePitch: number;
  voiceRate: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingChunks?: GroundingChunk[];
  isDeepThinking?: boolean;
  isBookmarked?: boolean;
}

export interface DailyReminder {
  id: string;
  title: string;
  time: string;
  category: 'nutrition' | 'hydration' | 'rest' | 'peace' | 'custom';
  motherlyNote: string;
  completed: boolean;
  isDefault?: boolean;
}

export interface DailyBlessingData {
  blessing: string;
  wellnessTip: string;
  affirmation: string;
  tagline: string;
  dateKey?: string;
}

export interface DilemmaResult {
  id: string;
  dilemma: string;
  optionA?: string;
  optionB?: string;
  fears?: string;
  analysis: string;
  timestamp: number;
}
