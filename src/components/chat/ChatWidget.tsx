"use client";

import {
  Bot,
  ChevronLeft,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/types";

type Mode = "launcher" | "chat" | "voice";
type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error" | "unsupported";

type ChatApiResponse = {
  message?: string;
  quickReplies?: string[];
};

const STORAGE_KEY = "fastandup-rule-chat-history";
const STARTER_QUICK_REPLIES = ["Product benefits", "How to use", "Track order", "Offers"];
const START_GREETING = "Namaste! I am Rahul from Fast&Up. How can I help you today?";
const OPTIONS_GUIDE =
  "You can ask about: Product benefits, How to use, Track order, Offers";
const CALL_OPENING_SCRIPT = START_GREETING;
const FALLBACK_MESSAGE =
  "I'm sorry, I didn't understand that. You can ask about benefits, usage, orders, or offers.";

const STARTER_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content: START_GREETING,
  },
];

function WaveBars({ active }: { active: boolean }) {
  const heights = active ? ["h-2", "h-5", "h-7", "h-5", "h-2"] : ["h-1", "h-1", "h-1", "h-1", "h-1"];

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {heights.map((height, index) => (
        <span
          key={index}
          className={`block w-1.5 rounded-full transition-all duration-300 ${
            active ? "animate-pulse bg-brand-orange" : "bg-neutral-300"
          } ${height}`}
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}

async function fetchRuleBasedReply(messages: ChatMessage[], endpoint: "/api/chat" | "/api/voice") {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (response.status === 429) {
    throw new Error("Too many messages. Please wait a moment.");
  }

  if (!response.ok) {
    throw new Error(`Server error ${response.status}.`);
  }

  const payload = (await response.json()) as ChatApiResponse;

  return {
    message: payload.message ?? `${FALLBACK_MESSAGE}\n${OPTIONS_GUIDE}`,
    quickReplies:
      payload.quickReplies && payload.quickReplies.length > 0
        ? payload.quickReplies
        : STARTER_QUICK_REPLIES,
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("launcher");

  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(STARTER_QUICK_REPLIES);
  const [hasLoaded, setHasLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceHistory, setVoiceHistory] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceHistoryRef = useRef<ChatMessage[]>([]);
  const callActiveRef = useRef(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    voiceHistoryRef.current = voiceHistory;
  }, [voiceHistory]);

  useEffect(() => {
    callActiveRef.current = callActive;
  }, [callActive]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        setMessages(STARTER_MESSAGES);
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [hasLoaded, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open]);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        return;
      }

      synthRef.current.cancel();
      setVoiceStatus("speaking");

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.02;
      utterance.pitch = 1;

      utterance.onend = () => {
        if (callActiveRef.current && !isMutedRef.current) {
          setVoiceStatus("listening");
          setTranscript("");
          try {
            recognitionRef.current?.start();
          } catch {
            // no-op
          }
        } else {
          setVoiceStatus("idle");
        }
      };

      utterance.onerror = () => {
        setVoiceStatus("error");
        setVoiceError("Voice playback failed. Please try again.");
      };

      synthRef.current.speak(utterance);
    },
    []
  );

  const handleVoiceInput = useCallback(
    async (text: string) => {
      setVoiceStatus("thinking");
      setVoiceReply("");
      setVoiceError("");

      const nextHistory = [...voiceHistoryRef.current, { role: "user", content: text }] as ChatMessage[];
      setVoiceHistory(nextHistory);

      try {
        const { message: reply } = await fetchRuleBasedReply(nextHistory, "/api/voice");
        const updatedHistory = [...nextHistory, { role: "assistant", content: reply }] as ChatMessage[];

        setVoiceHistory(updatedHistory);
        setVoiceReply(reply);
        speakText(reply);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong.";
        setVoiceError(message);
        setVoiceStatus("error");
      }
    },
    [speakText]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("unsupported");
      return;
    }

    synthRef.current = window.speechSynthesis;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text: string = event.results[0][0].transcript.trim();
      if (!text) return;
      setTranscript(text);
      void handleVoiceInput(text);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" && callActiveRef.current && !isMutedRef.current) {
        try {
          recognition.start();
        } catch {
          // no-op
        }
        return;
      }

      const message =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow access in browser settings."
          : "Speech recognition failed. Please try again.";

      setVoiceError(message);
      setVoiceStatus("error");
    };

    recognition.onend = () => {
      if (!callActiveRef.current || isMutedRef.current) return;
      if (window.speechSynthesis.speaking) return;

      try {
        recognition.start();
      } catch {
        // no-op
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // no-op
      }
      recognitionRef.current = null;
    };
  }, [handleVoiceInput]);

  const startCall = useCallback(() => {
    if (voiceStatus === "unsupported") return;

    setCallActive(true);
    setIsMuted(false);
    setVoiceError("");
    setTranscript("");
    setVoiceReply(CALL_OPENING_SCRIPT);
    setVoiceHistory([{ role: "assistant", content: CALL_OPENING_SCRIPT }]);

    speakText(CALL_OPENING_SCRIPT);
  }, [speakText, voiceStatus]);

  const endCall = useCallback(() => {
    setCallActive(false);
    setIsMuted(false);
    setVoiceStatus("idle");
    setTranscript("");
    setVoiceReply("");
    stopRecognition();
    synthRef.current?.cancel();
  }, [stopRecognition]);

  const toggleMute = useCallback(() => {
    if (!callActiveRef.current) return;

    const nextMuted = !isMutedRef.current;
    setIsMuted(nextMuted);

    if (nextMuted) {
      setVoiceStatus("idle");
      stopRecognition();
      synthRef.current?.cancel();
      return;
    }

    setVoiceStatus("listening");
    setTranscript("");
    try {
      recognitionRef.current?.start();
    } catch {
      // no-op
    }
  }, [stopRecognition]);

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || isTyping) return;

    const nextMessages = [...messages, { role: "user", content: text }] as ChatMessage[];
    setMessages(nextMessages);
    setDraft("");
    setIsTyping(true);

    try {
      const { message, quickReplies: nextQuickReplies } = await fetchRuleBasedReply(
        nextMessages,
        "/api/chat"
      );

      setMessages((current) => [...current, { role: "assistant", content: message }]);
      setQuickReplies(nextQuickReplies);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${FALLBACK_MESSAGE}\n${OPTIONS_GUIDE}`,
        },
      ]);
      setQuickReplies(STARTER_QUICK_REPLIES);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function resetChat() {
    setMessages(STARTER_MESSAGES);
    setQuickReplies(STARTER_QUICK_REPLIES);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function handleClose() {
    endCall();
    setOpen(false);
    setTimeout(() => setMode("launcher"), 300);
  }

  return (
    <>
      {!open && (
        <button
          id="feature-chatbot-launcher"
          type="button"
          aria-label="Open Fast&Up Assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-lift hover:bg-brand-orangeDark"
        >
          <Bot size={24} />
        </button>
      )}

      {open && (
        <section
          aria-label="Fast&Up Assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[min(720px,92vh)] flex-col overflow-hidden rounded-t-lg border border-neutral-200 bg-white shadow-lift sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[408px] sm:rounded-lg"
        >
          {mode === "launcher" && (
            <>
              <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange text-white">
                    <Bot size={22} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-brand-black">Fast&Up Assistant</h2>
                    <p className="text-xs text-neutral-500">How can I help you today?</p>
                  </div>
                </div>
                <button aria-label="Close" className="btn-icon" onClick={handleClose}>
                  <X size={18} />
                </button>
              </header>

              <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-8">
                <button
                  onClick={() => setMode("chat")}
                  className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 text-left transition duration-200 hover:border-brand-orange hover:shadow-sm"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-orange transition group-hover:bg-brand-orange/10">
                    <MessageCircle size={24} />
                  </span>
                  <div>
                    <p className="font-bold text-brand-black">Chat with Rahul</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                      Rule-based answers for products, orders, and support
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMode("voice");
                    setVoiceReply("");
                    setTranscript("");
                    setVoiceError("");
                  }}
                  className="group flex items-center gap-4 rounded-xl border-2 border-brand-orange bg-brand-orange/5 p-5 text-left transition duration-200 hover:bg-brand-orange/10 hover:shadow-md"
                >
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md">
                    <Phone size={22} />
                  </span>
                  <div>
                    <p className="font-bold text-brand-black">Call with Rahul</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                      Starts with official Fast&Up opening script
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {mode === "chat" && (
            <>
              <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <button aria-label="Back to menu" className="btn-icon" onClick={() => setMode("launcher")}>
                    <ChevronLeft size={18} />
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange text-white">
                    <Bot size={22} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-brand-black">Fast&Up Assistant Rahul</h2>
                    <p className="text-xs text-neutral-500">Short and precise support answers</p>
                  </div>
                </div>
                <button aria-label="Close chat" className="btn-icon" onClick={handleClose}>
                  <X size={18} />
                </button>
              </header>

              <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="flex gap-2 overflow-x-auto">
                  {quickReplies.map((prompt) => (
                    <button key={prompt} className="chip" onClick={() => void sendMessage(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="grid gap-3" role="log" aria-live="polite" aria-label="Chat messages">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${
                        message.role === "user"
                          ? "ml-auto bg-brand-orange text-white"
                          : "mr-auto bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mr-auto flex max-w-[86%] items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-500">
                      <Loader2 className="animate-spin text-brand-orange" size={16} />
                      Checking rule-based answer...
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="border-t border-neutral-200 bg-white p-4">
                <label htmlFor="chat-message" className="sr-label">
                  Message Fast&Up Assistant
                </label>
                <div className="flex items-end gap-2">
                  <textarea
                    id="chat-message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                    placeholder="Ask your question..."
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(draft);
                      }
                    }}
                  />
                  <button type="submit" className="btn-primary h-10 w-10 px-0" aria-label="Send message">
                    <Send size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-bold text-neutral-400 hover:text-brand-orange"
                  onClick={resetChat}
                >
                  Reset chat
                </button>
              </form>
            </>
          )}

          {mode === "voice" && (
            <>
              <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Back to menu"
                    className="btn-icon"
                    onClick={() => {
                      endCall();
                      setMode("launcher");
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange text-white">
                    <Phone size={20} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-brand-black">Fast&Up Calling Agent</h2>
                    <p className="text-xs text-neutral-500">
                      {voiceStatus === "unsupported"
                        ? "Voice not supported in this browser"
                        : callActive
                        ? isMuted
                          ? "Call active - muted"
                          : `Call active - ${voiceStatus}`
                        : "Ready to start call"}
                    </p>
                  </div>
                </div>
                <button aria-label="Close" className="btn-icon" onClick={handleClose}>
                  <X size={18} />
                </button>
              </header>

              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8">
                {voiceStatus === "unsupported" ? (
                  <div className="w-full rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                    <p className="font-bold text-red-600">Browser Not Supported</p>
                    <p className="mt-2 text-sm leading-relaxed text-red-500">
                      Voice calls require Chrome or Edge.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lift ${
                        voiceStatus === "listening"
                          ? "bg-green-500"
                          : voiceStatus === "thinking"
                          ? "bg-amber-500"
                          : voiceStatus === "speaking"
                          ? "bg-brand-orange"
                          : "bg-neutral-500"
                      }`}
                    >
                      {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <WaveBars active={voiceStatus === "listening" || voiceStatus === "speaking"} />
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        {voiceStatus}
                      </p>
                    </div>

                    {voiceError && (
                      <div className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                        {voiceError}
                      </div>
                    )}

                    {transcript && (
                      <div className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          You said
                        </p>
                        {transcript}
                      </div>
                    )}

                    {voiceReply && (
                      <div className="w-full rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-sm text-brand-black">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange">
                          Rahul replied
                        </p>
                        {voiceReply}
                      </div>
                    )}

                    <div className="flex w-full items-center justify-center gap-3 pt-2">
                      {!callActive ? (
                        <button
                          onClick={startCall}
                          className="flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-orangeDark"
                        >
                          <Phone size={16} />
                          Start Call
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={toggleMute}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold shadow-sm transition ${
                              isMuted
                                ? "border-brand-orange bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20"
                                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                            }`}
                          >
                            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                            {isMuted ? "Unmute" : "Mute"}
                          </button>

                          <button
                            onClick={endCall}
                            className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600"
                          >
                            <PhoneOff size={16} />
                            End Call
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
