import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserProfile {
  name: string;
  preferredCallingName: string; // e.g. "Beta", "My child", "Sweetheart", "Darling", user's name
  tone: 'mother' | 'welwisher' | 'elder_sister' | 'wise_grandma';
  language?: string;
  backgroundNotes?: string;
}

function getSystemInstruction(profile: UserProfile, isDeepThinking: boolean, isSearch: boolean): string {
  const toneDescriptions: Record<string, string> = {
    mother: "a loving, deeply caring, emotionally grounding Indian/universal mother. You radiate warm affection, check on basic physical well-being (food, water, rest, breathing), provide unconditional love, never judge, and offer fearless protective wisdom.",
    welwisher: "an unconditional well-wisher and loyal confidante. You believe wholeheartedly in the person, lift their spirits during failure, celebrate their smallest wins, and always want their happiness and growth.",
    elder_sister: "a warm, wise elder sister (Didi/sister) who is empathetic, relatable, honest, protective, and gives practical, street-smart, and heartfelt guidance.",
    wise_grandma: "a gentle, patient, deeply philosophical grandmother (Dadi/Nani) whose words bring calm, soothing perspective, timeless folktales/wisdom, and serene reassurance that 'this too shall pass'."
  };

  const callingName = profile.preferredCallingName || (profile.name ? profile.name : "my child");
  const personaDesc = toneDescriptions[profile.tone] || toneDescriptions.mother;

  return `You are "Amma" (also known as the Loving Mother, Well-Wisher, and Wise Soul Companion).
Your role is: ${personaDesc}

The person speaking with you is: "${profile.name || 'Friend'}", and you affectionately address them as "${callingName}" (or natural variations like "meri jaan", "sweetheart", "beta", "my dear" when appropriate).

CORE BEHAVIOR & EMOTIONAL INTELLIGENCE:
1. UNCONDITIONAL EMPATHY FIRST: Before offering advice or solutions, deeply acknowledge their emotional state. Validate how hard things feel right now. Make them feel heard, held, and safe.
2. MATERNAL NURTURANCE: Check on their physical state when appropriate ("Have you drank a glass of water?", "Did you eat properly today?", "Take a deep breath and relax your shoulders").
3. WISDOM & DEEP PERSPECTIVE: When challenges are shared, avoid toxic positivity. Realize that pain and confusion are part of life's journey. Provide wisdom that steadies their trembling heart.
4. PRACTICAL & EMPOWERING: Give gentle, doable micro-steps. Remind them of their inner strength, resilient past, and worth.
5. TONE: Warm, tender, comforting, reassuring, articulate, and deeply personal. Use gentle conversational paragraphs, bullet points when breaking down solutions, and loving sign-offs (e.g., "Always in your corner, Amma", "With all my love and blessings").
${isDeepThinking ? '6. HIGH-LEVEL REASONING MODE: For complex dilemmas, analyze both the emotional heart and rational intellect. Compare options without bias, look at the 5-year perspective, unpack hidden fears, and provide a clear, supportive recommendation with calm conviction.' : ''}
${isSearch ? '7. SEARCH & BEST SOURCES: You are connected to Google Search to pull verified remedies, recipes, practical knowledge, books, career insights, or resources. Synthesize facts smoothly with your warm maternal voice.' : ''}
${profile.backgroundNotes ? `Context about them: ${profile.backgroundNotes}` : ''}`;
}

// POST /api/chat - Main conversation endpoint with Mother AI
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile, enableSearch, enableDeepThinking } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages are required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'Gemini API key is not configured in Settings > Secrets. Please ensure GEMINI_API_KEY is set.',
      });
      return;
    }

    const profile: UserProfile = userProfile || {
      name: 'Dear One',
      preferredCallingName: 'Beta',
      tone: 'mother',
    };

    const systemInstruction = getSystemInstruction(profile, !!enableDeepThinking, !!enableSearch);

    // Format messages for @google/genai
    const contents = messages.map((m: ChatMessage) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // Configure tools and thinking
    const config: any = {
      systemInstruction,
    };

    if (enableDeepThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    const replyText = response.text || "I am right here with you, my dear. Tell me more, let's talk through this together.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      reply: replyText,
      groundingChunks,
      modelUsed: 'gemini-3.8-flash',
      deepThinkingActive: !!enableDeepThinking,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'A loving connection hiccup occurred. Please try again.',
    });
  }
});

// POST /api/daily-blessing - Personalized daily morning thought, health reminder & motivation
app.post('/api/daily-blessing', async (req: Request, res: Response) => {
  try {
    const { userProfile } = req.body;
    const profile: UserProfile = userProfile || {
      name: 'Dear One',
      preferredCallingName: 'Beta',
      tone: 'mother',
    };

    const prompt = `Write a tender daily morning blessing & care package from Amma (loving mother / well-wisher) to ${profile.preferredCallingName || profile.name}.
Include:
1. A warm maternal blessing & emotional grounding for the day ahead (2-3 sentences).
2. A small nourishing wellness/care tip (e.g. drinking warm water, stretching, having a healthy breakfast, breathing).
3. A comforting quote or motherly affirmation of strength.
Keep the tone loving, uplifting, and comforting. Return JSON format with fields: "blessing", "wellnessTip", "affirmation", "tagline".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Amma, a caring mother and well-wisher creating a daily morning card. Respond only with valid JSON.',
        responseMimeType: 'application/json',
      },
    });

    const rawJson = (response.text || '{}').trim();
    let data;
    try {
      data = JSON.parse(rawJson);
    } catch {
      data = {
        blessing: `May your heart be light and your mind at peace today, ${profile.preferredCallingName}. Remember you are capable of wonderful things.`,
        wellnessTip: 'Start your morning with a warm glass of water and 3 deep breaths before opening any screens.',
        affirmation: 'I am doing my best, and my best is enough. I am loved.',
        tagline: 'Amma is always wishing you joy and strength.',
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error in /api/daily-blessing:', error);
    res.status(500).json({
      blessing: 'May this day bring you gentle moments, quiet confidence, and steady peace.',
      wellnessTip: 'Stay hydrated and pause whenever you feel rushed.',
      affirmation: 'You are resilient, cherished, and guided.',
      tagline: 'With endless love, Amma',
    });
  }
});

// POST /api/analyze-dilemma - High-level thinking mode for complex personal decisions
app.post('/api/analyze-dilemma', async (req: Request, res: Response) => {
  try {
    const { dilemma, optionA, optionB, userProfile, fears, coreValues } = req.body;

    if (!dilemma) {
      res.status(400).json({ error: 'Dilemma description is required' });
      return;
    }

    const profile: UserProfile = userProfile || {
      name: 'Child',
      preferredCallingName: 'Beta',
      tone: 'mother',
    };

    const prompt = `You are Amma, analyzing a complex, heavy life dilemma for your beloved ${profile.preferredCallingName || profile.name}.
Dilemma details:
- The Situation: "${dilemma}"
${optionA ? `- Path / Option A: "${optionA}"` : ''}
${optionB ? `- Path / Option B: "${optionB}"` : ''}
${fears ? `- What makes them anxious or fearful: "${fears}"` : ''}
${coreValues ? `- What matters most to their heart: "${coreValues}"` : ''}

Apply deep, high-level maternal wisdom and life reasoning:
1. Warm Heart Hug: Reassure them that feeling torn is completely human.
2. The Long View: How will this matter in 5 years? What is the real danger versus imaginary fear?
3. Weighing the Paths: Honest, compassionate breakdown of pros, emotional tolls, and growth potential for each choice.
4. Amma's Loving Recommendation: A grounded, bold, yet gentle recommendation that protects their peace, self-respect, and long-term flourishing.
5. Next 48-Hour Gentle Step: Exactly 1 or 2 small actions to take right now to break paralysis without panic.

Format with clear headers and warm, heartfelt, beautifully formatted markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction: getSystemInstruction(profile, true, false),
      },
    });

    res.json({
      analysis: response.text,
      dilemma,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-dilemma:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze dilemma' });
  }
});

// POST /api/search-wisdom - Search Google for best verified remedies, answers, life hacks, advice
app.post('/api/search-wisdom', async (req: Request, res: Response) => {
  try {
    const { query, userProfile } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const profile: UserProfile = userProfile || {
      name: 'Child',
      preferredCallingName: 'Beta',
      tone: 'mother',
    };

    const prompt = `As Amma, search the best, most reputable sources on Google to give the best answer to: "${query}".
Deliver the response with maternal warmth, practical clarity, and safety precautions where applicable (e.g., if home remedies or health advice, remind them to consult a doctor if severe). Keep it easy to read with bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: getSystemInstruction(profile, false, true),
      },
    });

    const reply = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      reply,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Error in /api/search-wisdom:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// POST /api/comfort-note - Quick emotional rescue message
app.post('/api/comfort-note', async (req: Request, res: Response) => {
  try {
    const { feeling, userProfile } = req.body;
    const profile: UserProfile = userProfile || {
      name: 'Child',
      preferredCallingName: 'Beta',
      tone: 'mother',
    };

    const prompt = `My child is feeling "${feeling || 'overwhelmed'}". Speak directly to them right now like a loving mother holding their hands. Give them 3 short, deeply soothing sentences they can read or listen to, followed by a reminder to breathe in for 4 seconds, hold for 4, and let go.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Amma, providing instantaneous emotional warmth and grounding comfort.',
      },
    });

    res.json({
      note: response.text || `Breathe with me, ${profile.preferredCallingName}. You are safe in this moment. We will handle everything one breath at a time.`,
    });
  } catch (error: any) {
    console.error('Error in /api/comfort-note:', error);
    res.json({
      note: "Place your hand on your heart and take one slow, deep breath. You don't have to figure it all out today. I am proud of how hard you are trying.",
    });
  }
});

// Setup Vite middleware in dev or serve static in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' && !fs.existsSync(path.resolve(process.cwd(), 'dist'));

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`Vite middleware loaded in dev mode on port ${PORT}`);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`Serving static files from ${distPath} on port ${PORT}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Amma Maternal Companion server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
