import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Search,
  Brain,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Mic,
  MicOff,
  ExternalLink,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, UserProfile, GroundingChunk } from '../../types';
import { speakMaternalVoice, stopMaternalVoice } from '../../utils/audio';

interface ChatTabProps {
  profile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string, enableSearch: boolean, enableDeepThinking: boolean) => Promise<void>;
  onToggleBookmark: (msg: ChatMessage) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  initialPrompt?: { text: string; search?: boolean; deepThinking?: boolean } | null;
  onClearInitialPrompt?: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  profile,
  messages,
  onSendMessage,
  onToggleBookmark,
  onClearHistory,
  isLoading,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [enableSearch, setEnableSearch] = useState<boolean>(false);
  const [enableDeepThinking, setEnableDeepThinking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle incoming initialPrompt if navigated from Home or another tab
  useEffect(() => {
    if (initialPrompt && initialPrompt.text) {
      setInputText(initialPrompt.text);
      if (initialPrompt.search !== undefined) setEnableSearch(initialPrompt.search);
      if (initialPrompt.deepThinking !== undefined) setEnableDeepThinking(initialPrompt.deepThinking);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Handle Speech Recognition (Voice Input)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    await onSendMessage(textToSend, enableSearch, enableDeepThinking);
  };

  const handleToggleVoice = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      stopMaternalVoice();
      setSpeakingMessageId(null);
    } else {
      stopMaternalVoice();
      setSpeakingMessageId(msg.id);
      speakMaternalVoice(
        msg.text,
        () => setSpeakingMessageId(null),
        profile.voicePitch,
        profile.voiceRate
      );
    }
  };

  const quickPrompts = [
    { label: "I'm overwhelmed today", prompt: "Amma, my head is spinning with too many things. Can you ground me and tell me what to do first?" },
    { label: "Search healthy remedy for fatigue", prompt: "Can you search Google for natural remedies, nutrition, and tips to recover from mental and physical fatigue?", search: true },
    { label: "Did I make a bad choice?", prompt: "Amma, I feel like I messed up recently and I can't stop replaying it in my head. Help me see it clearly.", deep: true },
    { label: "Feeling lonely tonight", prompt: "Amma, I'm feeling quite lonely and isolated tonight. Can you just talk to me?" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF7F2]">
      {/* Subheader / Capability Toggles */}
      <div className="px-4 py-2 bg-white/70 backdrop-blur-sm border-b border-amber-900/10 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          {/* Deep Thinking Toggle */}
          <button
            onClick={() => setEnableDeepThinking(!enableDeepThinking)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition ${
              enableDeepThinking
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
            title="Toggle High-Level Thinking for deep dilemmas"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Thinking</span>
          </button>

          {/* Google Search Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition ${
              enableSearch
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
            title="Ground answers in Google Search for verified sources & remedies"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search</span>
          </button>
        </div>

        <button
          onClick={onClearHistory}
          className="p-1 rounded text-stone-400 hover:text-rose-600 transition"
          title="Clear chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const isAmma = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAmma ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-xs relative text-xs leading-relaxed ${
                  isAmma
                    ? 'bg-white border border-amber-900/10 text-stone-800 rounded-tl-sm'
                    : 'bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-tr-sm shadow-sm'
                }`}
              >
                {/* Amma badge header for maternal message */}
                {isAmma && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-900/5">
                    <div className="flex items-center gap-1.5 text-rose-700 font-serif-warm font-semibold text-[11px]">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>Amma</span>
                      {msg.isDeepThinking && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-sans font-medium flex items-center gap-0.5">
                          <Brain className="w-2.5 h-2.5" /> High Thinking
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Audio Readout Button */}
                      <button
                        onClick={() => handleToggleVoice(msg)}
                        className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
                        title="Hear Amma read this aloud"
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Bookmark to Keepsakes */}
                      <button
                        onClick={() => onToggleBookmark(msg)}
                        className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-amber-600 transition"
                        title="Save to Mother's Keepsake Box"
                      >
                        {msg.isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounding / Search Citations */}
                {isAmma && msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-900/10">
                    <p className="text-[10px] font-semibold text-stone-500 flex items-center gap-1 mb-1.5">
                      <Search className="w-3 h-3 text-blue-500" />
                      <span>Verified Sources from Google:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingChunks.map((chunk: GroundingChunk, idx: number) => {
                        if (!chunk.web?.uri) return null;
                        return (
                          <a
                            key={idx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-medium border border-blue-200 transition"
                          >
                            <span className="truncate max-w-[140px]">
                              {chunk.web.title || new URL(chunk.web.uri).hostname}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[9px] text-stone-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="bg-white border border-amber-900/10 rounded-2xl p-3.5 rounded-tl-sm flex items-center gap-2 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="w-3 h-3 text-rose-500 animate-gentle-pulse" />
              </div>
              <span className="text-xs text-stone-600 font-medium">
                {enableDeepThinking
                  ? "Amma is thinking deeply from the heart and weighing life perspective..."
                  : enableSearch
                  ? "Amma is looking through trusted sources on Google..."
                  : "Amma is holding space and writing to you..."}
              </span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips if few messages */}
      {messages.length <= 3 && (
        <div className="px-4 py-1.5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(qp.prompt);
                if (qp.search) setEnableSearch(true);
                if (qp.deep) setEnableDeepThinking(true);
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white text-stone-600 hover:text-stone-900 hover:bg-amber-50 text-[11px] font-medium border border-amber-900/10 shadow-2xs transition"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-amber-900/10 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-2xl transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Speak to Amma'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Talk to Amma, ${profile.preferredCallingName || 'Beta'}...`}
            className="flex-1 bg-stone-50 border border-stone-200 focus:border-rose-400 focus:bg-white rounded-2xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1 px-1">
          <span>Powered by Gemini 3.8 Flash</span>
          <span>{enableDeepThinking ? '🧠 Deep Reflection ON' : enableSearch ? '🔍 Google Search ON' : 'Loving Mode'}</span>
        </div>
      </div>
    </div>
  );
};
