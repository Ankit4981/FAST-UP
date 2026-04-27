"use client";
/* eslint-disable react-hooks/immutability */

import {
  Bot,
  ChevronLeft,
  ExternalLink,
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

import { brandSocialLinks } from "@/lib/brand";
import type { ChatMessage } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode        = "launcher" | "chat" | "voice";
type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error" | "unsupported";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "fastandup-chat-history";

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi, I am Fast&Up Coach. Share your goal and activity level, or ask me about an order.",
  },
];

const quickPrompts = [
  "Find hydration for running",
  "Vegan muscle gain",
  "Track my order",
  "How to use tablets?",
];

// ─── Animated wave bars (voice mode) ─────────────────────────────────────────
function WaveBars({ active }: { active: boolean }) {
  const heights = active
    ? ["h-2", "h-5", "h-7", "h-5", "h-2"]
    : ["h-1", "h-1", "h-1", "h-1", "h-1"];

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`block w-1.5 rounded-full transition-all duration-300 ${h} ${
            active ? "animate-pulse bg-brand-orange" : "bg-neutral-300"
          }`}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ChatWidget() {
  const [open, setOpen]   = useState(false);
  const [mode, setMode]   = useState<Mode>("launcher");

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages]   = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // ── Voice state ─────────────────────────────────────────────────────────────
  const [voiceStatus, setVoiceStatus]   = useState<VoiceStatus>("idle");
  const [voiceHistory, setVoiceHistory] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript]     = useState("");
  const [voiceReply, setVoiceReply]     = useState("");
  const [voiceError, setVoiceError]     = useState("");
  const [callActive, setCallActive]     = useState(false);
  const [isMuted, setIsMuted]           = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef   = useRef<any>(null);
  const synthRef         = useRef<SpeechSynthesis | null>(null);
  const voiceHistoryRef  = useRef<ChatMessage[]>([]);
  const callActiveRef    = useRef(false);
  const isMutedRef       = useRef(false);

  // Keep refs in sync
  useEffect(() => { voiceHistoryRef.current = voiceHistory; }, [voiceHistory]);
  useEffect(() => { callActiveRef.current   = callActive;   }, [callActive]);
  useEffect(() => { isMutedRef.current      = isMuted;      }, [isMuted]);

  // ── Load chat history ────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMessages(JSON.parse(saved) as ChatMessage[]); }
      catch  { setMessages(starterMessages); }
    }
    setHasLoaded(true);
  }, []);

  // ── Persist chat history ─────────────────────────────────────────────────────
  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [hasLoaded, messages]);

  // ── Auto-scroll chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open]);

  // ── Init Web Speech API ──────────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceStatus("unsupported");
      return;
    }

    synthRef.current = window.speechSynthesis;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang            = "en-US";
    rec.interimResults  = false;
    rec.maxAlternatives = 1;
    rec.continuous      = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript.trim();
      setTranscript(text);
      handleVoiceInput(text);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "no-speech" && callActiveRef.current && !isMutedRef.current) {
        try { rec.start(); } catch { /* ignore */ }
        return;
      }
      const msg =
        e.error === "not-allowed"
          ? "Microphone access denied. Please allow it in your browser settings."
          : e.error === "network"
          ? "Network error with speech recognition. Try again."
          : "Speech recognition failed. Please try again.";
      setVoiceError(msg);
      setVoiceStatus("error");
    };

    rec.onend = () => {
      setVoiceStatus((s) => {
        if (s === "listening") return "idle";
        return s;
      });
    };

    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Voice: send transcript to /api/chat ──────────────────────────────────────
  const handleVoiceInput = useCallback(async (text: string) => {
    setVoiceStatus("thinking");
    setVoiceReply("");
    setVoiceError("");

    const newHistory: ChatMessage[] = [
      ...voiceHistoryRef.current,
      { role: "user", content: text },
    ];
    setVoiceHistory(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newHistory }),
      });

      if (res.status === 429) throw new Error("Too many messages. Please wait a moment.");
      if (!res.ok)            throw new Error(`Server error ${res.status}.`);

      const data                   = await res.json();
      const reply: string          = data.message ?? "Sorry, I couldn't get a response.";
      const updated: ChatMessage[] = [...newHistory, { role: "assistant", content: reply }];

      setVoiceReply(reply);
      setVoiceHistory(updated);
      speakText(reply);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setVoiceError(msg);
      setVoiceStatus("error");
    }
  }, []);

  // ── Text-to-Speech ────────────────────────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (!synthRef.current) return;
    setVoiceStatus("speaking");
    synthRef.current.cancel();

    const utterance    = new SpeechSynthesisUtterance(text);
    utterance.lang     = "en-US";
    utterance.rate     = 1.05;
    utterance.pitch    = 1;
    utterance.volume   = 1;

    const voices    = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Samantha"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      if (callActiveRef.current && !isMutedRef.current) {
        setVoiceStatus("listening");
        setTranscript("");
        try { recognitionRef.current?.start(); } catch { /* already started */ }
      } else {
        setVoiceStatus("idle");
      }
    };

    utterance.onerror = () => setVoiceStatus("idle");
    synthRef.current.speak(utterance);
  }, []);

  // ── Start call ────────────────────────────────────────────────────────────────
  const startCall = useCallback(() => {
    setCallActive(true);
    callActiveRef.current = true;
    setIsMuted(false);
    isMutedRef.current = false;
    setTranscript("");
    setVoiceReply("");
    setVoiceError("");
    synthRef.current?.cancel();
    setVoiceStatus("listening");
    try { recognitionRef.current?.start(); } catch { /* already started */ }
  }, []);

  // ── End call ──────────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    setCallActive(false);
    callActiveRef.current = false;
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
    setVoiceStatus("idle");
    setIsMuted(false);
  }, []);

  // ── Toggle mute ───────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    setIsMuted(next);
    isMutedRef.current = next;

    if (next) {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
      setVoiceStatus("idle");
    } else {
      setVoiceStatus("listening");
      setTranscript("");
      try { recognitionRef.current?.start(); } catch { /* ignore */ }
    }
  }, []);

  // ── Single tap-to-speak ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (voiceStatus !== "idle" && voiceStatus !== "error") return;
    synthRef.current?.cancel();
    setTranscript("");
    setVoiceReply("");
    setVoiceError("");
    setVoiceStatus("listening");
    try { recognitionRef.current?.start(); } catch { /* already started */ }
  }, [voiceStatus]);

  // ── Stop everything ───────────────────────────────────────────────────────────
  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
    setCallActive(false);
    callActiveRef.current = false;
    setVoiceStatus("idle");
  }, []);

  const clearVoice = useCallback(() => {
    stopVoice();
    setVoiceHistory([]);
    setTranscript("");
    setVoiceReply("");
    setVoiceError("");
    setIsMuted(false);
  }, [stopVoice]);

  // ── Chat: send message ────────────────────────────────────────────────────────
  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isTyping) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setIsTyping(true);

    try {
      const res     = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: nextMessages }),
      });
      const payload = await res.json();

      setMessages((cur) => [
        ...cur,
        {
          role:    "assistant",
          content: payload.message ?? "I could not reach the AI service. Please try again.",
        },
      ]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "I lost connection while answering. Please send that again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(draft);
  }

  function resetChat() {
    setMessages(starterMessages);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function handleClose() {
    stopVoice();
    setOpen(false);
    setTimeout(() => setMode("launcher"), 300);
  }

  function openMode(m: Mode) {
    if (m === "voice") clearVoice();
    setMode(m);
  }

  // ── Voice status config ───────────────────────────────────────────────────────
  const isPulsing = voiceStatus === "listening" || voiceStatus === "speaking";

  const voiceConfig: Record<
    VoiceStatus,
    { label: string; btnClass: string; textClass: string; icon: React.ReactNode }
  > = {
    idle:        { label: "Tap to speak",    btnClass: "bg-brand-orange hover:bg-brand-orangeDark", textClass: "text-brand-orange",  icon: <Mic size={28} /> },
    listening:   { label: "Listening…",      btnClass: "bg-red-500",                                textClass: "text-red-500",        icon: <Mic size={28} /> },
    thinking:    { label: "Thinking…",       btnClass: "bg-amber-500 cursor-not-allowed",            textClass: "text-amber-500",      icon: <Loader2 size={28} className="animate-spin" /> },
    speaking:    { label: "Coach speaking…", btnClass: "bg-green-500",                              textClass: "text-green-500",      icon: <MicOff size={28} /> },
    error:       { label: "Tap to retry",    btnClass: "bg-red-500 hover:bg-red-600",               textClass: "text-red-500",        icon: <Mic size={28} /> },
    unsupported: { label: "Not supported",   btnClass: "bg-neutral-400 cursor-not-allowed",          textClass: "text-neutral-400",    icon: <MicOff size={28} /> },
  };

  const vc = voiceConfig[voiceStatus];

  // ─────────────────────────────────────────────────────────────────────────────
  // Render: Closed FAB
  // ─────────────────────────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        id="ai-coach-button"
        aria-label="Open AI coach"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-lift transition hover:bg-brand-orangeDark sm:bottom-6 sm:right-6"
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render: Panel
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section
      aria-label="Fast&Up AI Coach"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[min(720px,92vh)] flex-col overflow-hidden rounded-t-lg border border-neutral-200 bg-white shadow-lift sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[408px] sm:rounded-lg"
    >

      {/* ════════════════════════════════════════ MODE: LAUNCHER ════════════════════════════════════════ */}
      {mode === "launcher" && (
        <>
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange text-white">
                <Bot size={22} aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-brand-black">Fast&amp;Up Coach</h2>
                <p className="text-xs text-neutral-500">How can we help you today?</p>
              </div>
            </div>
            <button aria-label="Close" className="btn-icon" onClick={handleClose}>
              <X size={18} />
            </button>
          </header>

          <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-8">
            {/* Chat card */}
            <button
              onClick={() => openMode("chat")}
              className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 text-left transition duration-200 hover:border-brand-orange hover:shadow-sm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-grey text-brand-orange transition group-hover:bg-brand-orange/10">
                <MessageCircle size={24} />
              </span>
              <div>
                <p className="font-bold text-brand-black">Chat with Coach</p>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                  Text-based · products, orders &amp; support
                </p>
              </div>
            </button>

            {/* Voice card */}
            <button
              onClick={() => openMode("voice")}
              className="group relative flex items-center gap-4 rounded-xl border-2 border-brand-orange bg-brand-orange/5 p-5 text-left transition duration-200 hover:bg-brand-orange/10 hover:shadow-md"
            >
              <span className="absolute right-3 top-3 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                NEW
              </span>
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-xl bg-brand-orange opacity-20" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md">
                  <Phone size={22} />
                </span>
              </span>
              <div>
                <p className="font-bold text-brand-black">Talk to Coach</p>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                  Voice call · speak naturally, get instant answers
                </p>
              </div>
            </button>

            <p className="text-center text-xs text-neutral-400">
              Powered by Ollama · Chrome &amp; Edge for voice
            </p>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════ MODE: CHAT ════════════════════════════════════════ */}
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
                <h2 className="text-sm font-bold text-brand-black">Fast&amp;Up Coach</h2>
                <p className="text-xs text-neutral-500">Products, orders and support</p>
              </div>
            </div>
            <button aria-label="Close chat" className="btn-icon" onClick={handleClose}>
              <X size={18} />
            </button>
          </header>

          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {quickPrompts.map((prompt) => (
                <button key={prompt} className="chip" onClick={() => void sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="grid gap-3" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${
                    msg.role === "user"
                      ? "ml-auto bg-brand-orange text-white"
                      : "mr-auto bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="mr-auto flex max-w-[86%] items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-500">
                  <Loader2 className="animate-spin text-brand-orange" size={16} />
                  Checking product and support context...
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Official channels
            </p>
            <div className="flex flex-wrap gap-2">
              {brandSocialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="chip">
                  {link.label}
                  <ExternalLink size={12} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-neutral-200 bg-white p-4">
            <label htmlFor="chat-message" className="sr-label">
              Message Fast&amp;Up Coach
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                placeholder="Ask for a recommendation or support..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
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

      {/* ════════════════════════════════════════ MODE: VOICE ════════════════════════════════════════ */}
      {mode === "voice" && (
        <>
          <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                aria-label="Back to menu"
                className="btn-icon"
                onClick={() => { endCall(); setMode("launcher"); }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-orange text-white">
                <Phone size={20} aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-brand-black">Talk to Coach</h2>
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  {voiceStatus === "listening" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
                  {voiceStatus === "speaking"  && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />}
                  {voiceStatus === "thinking"  && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />}
                  {voiceStatus === "idle"        ? callActive ? (isMuted ? "Muted" : "Call active") : "Voice call ready" : ""}
                  {voiceStatus === "listening"   ? "Live · listening"   : ""}
                  {voiceStatus === "thinking"    ? "Processing…"        : ""}
                  {voiceStatus === "speaking"    ? "Coach is speaking"  : ""}
                  {voiceStatus === "error"       ? "Error · see below"  : ""}
                  {voiceStatus === "unsupported" ? "Not supported"      : ""}
                </p>
              </div>
            </div>
            <button aria-label="Close" className="btn-icon" onClick={handleClose}>
              <X size={18} />
            </button>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8">

            {/* Unsupported browser */}
            {voiceStatus === "unsupported" ? (
              <div className="w-full rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="font-bold text-red-600">Browser Not Supported</p>
                <p className="mt-2 text-sm leading-relaxed text-red-500">
                  Voice calls require <strong>Chrome</strong> or <strong>Edge</strong>.
                  <br />Please switch browsers to use this feature.
                </p>
              </div>
            ) : (
              <>
                {/* Mic button */}
                <div className="relative flex items-center justify-center">
                  {isPulsing && (
                    <>
                      <span className={`absolute h-32 w-32 animate-ping rounded-full opacity-10 ${voiceStatus === "listening" ? "bg-red-500" : "bg-green-500"}`} />
                      <span className={`absolute h-24 w-24 animate-pulse rounded-full opacity-20 ${voiceStatus === "listening" ? "bg-red-500" : "bg-green-500"}`} />
                    </>
                  )}
                  <button
                    onClick={
                      callActive
                        ? undefined
                        : voiceStatus === "idle" || voiceStatus === "error"
                        ? startListening
                        : stopVoice
                    }
                    disabled={voiceStatus === "thinking" || callActive}
                    className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lift transition duration-200 ${vc.btnClass} ${
                      !callActive && (voiceStatus === "idle" || voiceStatus === "error") ? "active:scale-95" : ""
                    }`}
                    aria-label={callActive ? "Call in progress" : vc.label}
                  >
                    {isMuted && callActive ? <MicOff size={28} /> : vc.icon}
                  </button>
                </div>

                {/* Wave bars + label */}
                <div className="flex flex-col items-center gap-2">
                  <WaveBars active={isPulsing && !isMuted} />
                  <p className={`text-xs font-bold uppercase tracking-widest ${vc.textClass}`}>
                    {callActive ? (isMuted ? "Muted" : vc.label) : vc.label}
                  </p>
                </div>

                {/* Error banner */}
                {voiceStatus === "error" && voiceError && (
                  <div className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    ⚠️ {voiceError}
                  </div>
                )}

                {/* Thinking dots */}
                {voiceStatus === "thinking" && (
                  <div className="flex gap-1.5" aria-label="Thinking">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-orange"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                )}

                {/* You said bubble */}
                {transcript && voiceStatus !== "error" && (
                  <div className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">You said</p>
                    {transcript}
                  </div>
                )}

                {/* Coach reply bubble */}
                {voiceReply && voiceStatus !== "thinking" && (
                  <div className="w-full rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-sm text-brand-black">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange">Coach replied</p>
                    {voiceReply}
                  </div>
                )}

                {/* Empty state */}
                {!transcript && !voiceReply && !callActive && voiceStatus === "idle" && (
                  <p className="text-center text-sm leading-relaxed text-neutral-400">
                    Tap <strong>Start Call</strong> for a continuous voice conversation,
                    <br />or tap the mic for a single question.
                  </p>
                )}

                {/* Call controls */}
                <div className="flex w-full items-center justify-center gap-3 pt-2">
                  {!callActive ? (
                    <button
                      onClick={startCall}
                      disabled={voiceStatus === "thinking" || voiceStatus === "speaking"}
                      className="flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-orangeDark disabled:cursor-not-allowed disabled:opacity-50"
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
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                        {isMuted ? "Unmute" : "Mute"}
                      </button>

                      <button
                        onClick={endCall}
                        className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600"
                        aria-label="End call"
                      >
                        <PhoneOff size={16} />
                        End Call
                      </button>
                    </>
                  )}
                </div>

                {/* Clear conversation */}
                {(transcript || voiceReply) && voiceStatus !== "thinking" && !callActive && (
                  <button
                    onClick={clearVoice}
                    className="text-xs font-bold text-neutral-400 hover:text-brand-orange"
                  >
                    Clear conversation
                  </button>
                )}
              </>
            )}
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-xs text-neutral-400">
            Uses your microphone · Works on Chrome &amp; Edge only
          </div>
        </>
      )}
    </section>
  );
}
