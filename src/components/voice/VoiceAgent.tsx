"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CallState = "idle" | "ringing" | "connected" | "ended";
type TurnState = "listening" | "thinking" | "speaking" | "muted" | "error";

interface Transcript {
  role: "user" | "coach";
  text: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GREETING =
  "Hello! Welcome to Fast and Up. I'm your personal nutrition coach. How can I help you reach your goals today?";

const FALLBACKS = [
  "Sorry, I didn't catch that — could you say that again?",
  "I'm having a small hiccup. Can you repeat that for me?",
  "My apologies — please try once more!",
];

// ─── Audio helpers (no ring.mp3 needed) ───────────────────────────────────────
function createAudioCtx(): AudioContext {
  return new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext)();
}

function playRing(ctx: AudioContext) {
  const beep = (freq: number, start: number, dur: number) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + start + dur - 0.04);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur);
  };
  // Classic landline double-ring
  beep(440, 0,   0.4);
  beep(480, 0,   0.4);
  beep(440, 0.5, 0.4);
  beep(480, 0.5, 0.4);
}

function playConnectBeep(ctx: AudioContext) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.25);
}

function playDisconnectBeep(ctx: AudioContext) {
  [0, 0.18, 0.36].forEach((t) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 480;
    gain.gain.setValueAtTime(0.1, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.14);
    osc.start(ctx.currentTime + t);
    osc.stop(ctx.currentTime + t + 0.14);
  });
}

// ─── Sound-wave visualiser ────────────────────────────────────────────────────
function SoundWave({ active, color = "#F26522" }: { active: boolean; color?: string }) {
  const heights = [3, 7, 5, 9, 4, 8, 6, 10, 5, 7, 3, 6, 8, 4, 9];
  return (
    <div className="flex items-center justify-center gap-[3px]" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 3,
            borderRadius: 99,
            backgroundColor: color,
            height: active ? `${h * 2.6}px` : "3px",
            opacity: active ? 0.85 + (i % 3) * 0.05 : 0.2,
            transition: "height 0.12s ease, opacity 0.25s ease",
            animation: active
              ? `voiceWave 0.75s ease-in-out ${i * 55}ms infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Call timer ───────────────────────────────────────────────────────────────
function CallTimer({ running }: { running: boolean }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      setSecs(0);
      ref.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="font-mono text-sm tabular-nums" style={{ color: "#999" }}>
      {mm}:{ss}
    </span>
  );
}

// ─── Pulsing ring animation component ────────────────────────────────────────
function PulseRings({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            animation: `voiceRing 1.6s ease-out ${i * 0.4}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function VoiceAgent() {
  const [callState, setCallState]     = useState<CallState>("idle");
  const [turnState, setTurnState]     = useState<TurnState>("listening");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [statusLine, setStatusLine]   = useState("");
  const [errorMsg, setErrorMsg]       = useState("");
  const [isMuted, setIsMuted]         = useState(false);
  const [supported, setSupported]     = useState(true);
  const [isOpen, setIsOpen]           = useState(false);
  const [liveInterim, setLiveInterim] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef            = useRef<any>(null);
  const synthRef          = useRef<SpeechSynthesis | null>(null);
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const ringIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef        = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const callActiveRef     = useRef(false);
  const isMutedRef        = useRef(false);
  const isSpeakingRef     = useRef(false);   // true while TTS is playing — blocks mic restart
  const transcriptListRef = useRef<HTMLDivElement>(null);

  // Keep muted ref in sync
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptListRef.current?.scrollTo({
      top: transcriptListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcripts]);

  // ── speak ──────────────────────────────────────────────────────────────────
  // Splits at sentence boundaries to fix Chrome TTS cut-off bug (>200 chars).
  const speak = useCallback((text: string, onDone?: () => void) => {
    const synth = synthRef.current;
    if (!synth) { onDone?.(); return; }

    synth.cancel();
    isSpeakingRef.current = true;
    setTurnState("speaking");
    setStatusLine("Speaking…");
    setLiveInterim("");

    // Split on sentence endings so Chrome never chops mid-sentence
    const sentences = text
      .replace(/([.!?])\s+/g, "$1|||")
      .split("|||")
      .map((s) => s.trim())
      .filter(Boolean);

    const voices = synth.getVoices();
    const best   =
      voices.find((v) => v.lang === "en-US" && v.name.includes("Samantha")) ||
      voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
      voices.find((v) => v.lang === "en-US" && v.name.includes("Karen")) ||
      voices.find((v) => v.lang === "en-US" && !v.localService) ||
      voices.find((v) => v.lang.startsWith("en"));

    let idx = 0;
    const speakNext = () => {
      if (idx >= sentences.length) {
        isSpeakingRef.current = false;
        onDone?.();
        return;
      }
      const utt    = new SpeechSynthesisUtterance(sentences[idx++]);
      utt.lang     = "en-US";
      utt.rate     = 1.05;
      utt.pitch    = 1.0;
      utt.volume   = 1;
      if (best) utt.voice = best;
      utt.onend   = speakNext;
      utt.onerror = () => { isSpeakingRef.current = false; onDone?.(); };
      synth.speak(utt);
    };

    speakNext();
  }, []);

  // ── startListening ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!callActiveRef.current || isMutedRef.current) return;
    setTurnState("listening");
    setStatusLine("Listening…");
    setLiveInterim("");
    try { recRef.current?.start(); } catch { /* already running */ }
  }, []);

  // ── sendMessage ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (userText: string) => {
    setTurnState("thinking");
    setStatusLine("Thinking…");
    setLiveInterim("");

    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: userText },
    ];

    let reply = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];

    try {
      const res = await fetch("/api/voice", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: historyRef.current }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = (data.message as string)?.trim() || reply;
      }
    } catch {
      // network issue — use fallback silently
    }

    historyRef.current = [
      ...historyRef.current,
      { role: "assistant", content: reply },
    ];
    setTranscripts((t) => [...t, { role: "coach", text: reply }]);

    if (audioCtxRef.current) playConnectBeep(audioCtxRef.current);

    speak(reply, () => {
      if (!callActiveRef.current) return;
      if (isMutedRef.current) {
        setTurnState("muted");
        setStatusLine("Muted");
      } else {
        startListening();
      }
    });
  }, [speak, startListening]);

  // ── Init SpeechRecognition ────────────────────────────────────────────────
  useEffect(() => {
    const SR =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    synthRef.current = window.speechSynthesis;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang            = "en-US";
    rec.interimResults  = true;   // for live captions
    rec.maxAlternatives = 1;
    rec.continuous      = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let final   = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final  += e.results[i][0].transcript;
        else                       interim += e.results[i][0].transcript;
      }
      if (interim) setLiveInterim(interim);
      if (final && callActiveRef.current) {
        setLiveInterim("");
        setTranscripts((t) => [...t, { role: "user", text: final.trim() }]);
        void sendMessage(final.trim());
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        setErrorMsg("Microphone access denied. Please allow mic in browser settings.");
        setTurnState("error");
        return;
      }
      if (callActiveRef.current && !isMutedRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!isSpeakingRef.current) {
            try { rec.start(); } catch { /* ignore */ }
          }
        }, 400);
      }
    };

    rec.onend = () => {
      // CRITICAL: never restart mic while AI is speaking — causes echo loop
      if (callActiveRef.current && !isMutedRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!isSpeakingRef.current) {
            try { rec.start(); } catch { /* ignore */ }
          }
        }, 250);
      }
    };

    recRef.current = rec;

    return () => {
      try { rec.stop(); } catch { /* ignore */ }
    };
  }, [sendMessage]);

  // ── startCall ─────────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioCtx();
    await audioCtxRef.current.resume();

    setCallState("ringing");
    setTranscripts([]);
    historyRef.current = [];
    setErrorMsg("");
    setLiveInterim("");
    setStatusLine("Calling…");

    let ringCount = 0;
    playRing(audioCtxRef.current);
    ringCount++;

    ringIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current) return;
      playRing(audioCtxRef.current);
      ringCount++;
      if (ringCount >= 3) {
        clearInterval(ringIntervalRef.current!);
        ringIntervalRef.current = null;
        callActiveRef.current = true;
        setCallState("connected");
        setStatusLine("Connected");
        if (audioCtxRef.current) playConnectBeep(audioCtxRef.current);
        setTimeout(() => {
          speak(GREETING, () => {
            if (callActiveRef.current) startListening();
          });
        }, 400);
      }
    }, 2000);
  }, [speak, startListening]);

  // ── endCall ───────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    callActiveRef.current = false;
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    synthRef.current?.cancel();
    try { recRef.current?.stop(); } catch { /* ignore */ }
    if (audioCtxRef.current) playDisconnectBeep(audioCtxRef.current);
    setCallState("ended");
    setTurnState("listening");
    setStatusLine("");
    setIsMuted(false);
    setLiveInterim("");
  }, []);

  // ── toggleMute ────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        try { recRef.current?.stop(); } catch { /* ignore */ }
        synthRef.current?.cancel();
        setTurnState("muted");
        setStatusLine("Muted");
      } else {
        setTurnState("listening");
        setStatusLine("Listening…");
        setTimeout(() => {
          try { recRef.current?.start(); } catch { /* ignore */ }
        }, 100);
      }
      return next;
    });
  }, []);

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isIdle      = callState === "idle";
  const isRinging   = callState === "ringing";
  const isConnected = callState === "connected";
  const isEnded     = callState === "ended";

  // ── Avatar ring colour ────────────────────────────────────────────────────
  const ringColor =
    isRinging                          ? "#F26522" :
    turnState === "speaking"           ? "#22c55e" :
    turnState === "listening"          ? "#3b82f6" :
    turnState === "thinking"           ? "#a855f7" :
    turnState === "muted"              ? "#6b7280" :
                                         "#F26522";

  // ── Status label ──────────────────────────────────────────────────────────
  const statusEmoji =
    isRinging                 ? "☎️" :
    turnState === "speaking"  ? "🔊" :
    turnState === "listening" ? "🎤" :
    turnState === "thinking"  ? "⚡" :
    turnState === "muted"     ? "🔇" :
    turnState === "error"     ? "⚠️" : "";

  return (
    <>
      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes voiceRing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes voiceWave {
          from { height: 3px;  }
          to   { height: 22px; }
        }
        @keyframes voiceFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes voiceSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes voicePulse {
          0%, 100% { opacity: 1;   }
          50%      { opacity: 0.4; }
        }
        @keyframes thinkDot {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
          40%            { transform: scale(1.5); opacity: 1;   }
        }
        .voice-widget {
          animation: voiceFadeUp 0.3s ease;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }
        .voice-transcript-bubble {
          animation: voiceFadeUp 0.25s ease;
        }
        .voice-scrollbar::-webkit-scrollbar { width: 4px; }
        .voice-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .voice-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* ── Floating button (always visible) ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close voice agent" : "Open voice agent"}
        style={{
          position:     "fixed",
          bottom:       88,          // above chat widget if present
          right:        24,
          zIndex:       9998,
          width:        56,
          height:       56,
          borderRadius: "50%",
          border:       "none",
          background:   isConnected
            ? "linear-gradient(135deg,#22c55e,#16a34a)"
            : "linear-gradient(135deg,#F26522,#D4541A)",
          color:        "#fff",
          fontSize:     22,
          cursor:       "pointer",
          boxShadow:    "0 8px 28px rgba(0,0,0,0.35)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          transition:   "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.35)";
        }}
      >
        {isConnected ? <Volume2 size={22} /> : <Phone size={22} />}
      </button>

      {/* ── Main panel ── */}
      {isOpen && (
        <div
          className="voice-widget"
          style={{
            position:     "fixed",
            bottom:       156,
            right:        24,
            zIndex:       9999,
            width:        340,
            borderRadius: 24,
            overflow:     "hidden",
            background:   "linear-gradient(160deg,#161a23 0%,#0e1118 100%)",
            border:       "1px solid rgba(255,255,255,0.08)",
            boxShadow:    "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* ── Header strip ── */}
          <div style={{
            padding:        "14px 18px",
            borderBottom:   "1px solid rgba(255,255,255,0.06)",
            display:        "flex",
            alignItems:     "center",
            gap:            10,
            background:     "rgba(255,255,255,0.03)",
          }}>
            <div style={{
              width:        36,
              height:       36,
              borderRadius: "50%",
              background:   "linear-gradient(135deg,#F26522,#D4541A)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     18,
              flexShrink:   0,
            }}>
              💪
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.2 }}>
                Coach Alex
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>
                Fast&amp;Up Nutrition Coach
              </div>
            </div>
            {isConnected && <CallTimer running={isConnected} />}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background:   "none",
                border:       "none",
                color:        "#555",
                cursor:       "pointer",
                fontSize:     18,
                lineHeight:   1,
                padding:      "2px 4px",
                borderRadius: 6,
                transition:   "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
              aria-label="Minimise"
            >
              ✕
            </button>
          </div>

          {/* ── Avatar section ── */}
          <div style={{
            padding:        "28px 24px 16px",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            14,
          }}>
            {/* Avatar + rings */}
            <div style={{ position: "relative", width: 88, height: 88 }}>
              <PulseRings
                active={isRinging || turnState === "listening" || turnState === "speaking"}
                color={ringColor}
              />
              <div style={{
                width:          88,
                height:         88,
                borderRadius:   "50%",
                background:     "linear-gradient(145deg,#1e2533,#141820)",
                border:         `2.5px solid ${isConnected ? ringColor : "rgba(255,255,255,0.1)"}`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       36,
                position:       "relative",
                zIndex:         2,
                transition:     "border-color 0.3s ease",
                boxShadow:      isConnected
                  ? `0 0 0 4px ${ringColor}22, 0 8px 32px rgba(0,0,0,0.5)`
                  : "0 8px 32px rgba(0,0,0,0.4)",
              }}>
                🧑‍💼
              </div>
            </div>

            {/* Sound wave */}
            <div style={{ height: 28, display: "flex", alignItems: "center" }}>
              {turnState === "speaking" && (
                <SoundWave active color="#22c55e" />
              )}
              {turnState === "listening" && (
                <SoundWave active color="#3b82f6" />
              )}
              {turnState === "thinking" && (
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width:        7,
                      height:       7,
                      borderRadius: "50%",
                      background:   "#a855f7",
                      display:      "block",
                      animation:    `thinkDot 1.1s ease-in-out ${i * 0.18}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              {(isIdle || isEnded || (!isConnected && !isRinging)) && (
                <SoundWave active={false} />
              )}
              {isRinging && (
                <span style={{
                  fontSize:   13,
                  color:      "#F26522",
                  fontWeight: 600,
                  animation:  "voicePulse 1s ease-in-out infinite",
                }}>
                  ☎️ Ringing…
                </span>
              )}
            </div>

            {/* Status line */}
            {(isConnected || isRinging) && statusLine && (
              <div style={{
                display:        "flex",
                alignItems:     "center",
                gap:            6,
                background:     "rgba(255,255,255,0.04)",
                border:         "1px solid rgba(255,255,255,0.07)",
                borderRadius:   99,
                padding:        "5px 14px",
                fontSize:       12,
                color:          "#aaa",
                fontWeight:     600,
              }}>
                <span style={{
                  width:        7,
                  height:       7,
                  borderRadius: "50%",
                  background:   ringColor,
                  flexShrink:   0,
                  display:      "inline-block",
                  animation:    "voicePulse 1.2s ease-in-out infinite",
                }} />
                {statusEmoji} {statusLine}
              </div>
            )}

            {/* Live interim transcript */}
            {liveInterim && isConnected && (
              <div style={{
                fontSize:   12,
                color:      "#3b82f6",
                fontStyle:  "italic",
                textAlign:  "center",
                maxWidth:   260,
                lineHeight: 1.5,
                animation:  "voicePulse 0.8s ease-in-out infinite",
              }}>
                "{liveInterim}…"
              </div>
            )}

            {/* Error message */}
            {turnState === "error" && errorMsg && (
              <div style={{
                width:          "100%",
                background:     "rgba(239,68,68,0.1)",
                border:         "1px solid rgba(239,68,68,0.2)",
                borderRadius:   12,
                padding:        "10px 14px",
                color:          "#f87171",
                fontSize:       13,
                textAlign:      "center",
              }}>
                {errorMsg}
              </div>
            )}

            {/* Browser not supported */}
            {!supported && (
              <div style={{
                width:          "100%",
                background:     "rgba(239,68,68,0.08)",
                border:         "1px solid rgba(239,68,68,0.2)",
                borderRadius:   12,
                padding:        "12px 14px",
                color:          "#f87171",
                fontSize:       13,
                textAlign:      "center",
                lineHeight:     1.6,
              }}>
                <strong>Browser not supported.</strong><br />
                Use <strong>Chrome</strong> or <strong>Edge</strong> for voice calls.
              </div>
            )}
          </div>

          {/* ── Transcript ── */}
          {(isConnected || isEnded) && transcripts.length > 0 && (
            <div
              ref={transcriptListRef}
              className="voice-scrollbar"
              style={{
                margin:         "0 16px 8px",
                maxHeight:      200,
                overflowY:      "auto",
                display:        "flex",
                flexDirection:  "column",
                gap:            8,
              }}
            >
              {transcripts.map((t, i) => (
                <div
                  key={i}
                  className="voice-transcript-bubble"
                  style={{
                    display:        "flex",
                    justifyContent: t.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    maxWidth:     "82%",
                    background:   t.role === "user"
                      ? "linear-gradient(135deg,#F26522,#D4541A)"
                      : "rgba(255,255,255,0.06)",
                    border:       t.role === "coach"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                    borderRadius: t.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    padding:      "9px 13px",
                    color:        t.role === "user" ? "#fff" : "#ccc",
                    fontSize:     13,
                    lineHeight:   1.55,
                    fontWeight:   500,
                  }}>
                    {t.role === "coach" && (
                      <div style={{
                        fontSize:      10,
                        fontWeight:    700,
                        color:         "#F26522",
                        marginBottom:  3,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>
                        Coach
                      </div>
                    )}
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Controls ── */}
          <div style={{
            padding:        "20px 24px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            14,
            borderTop:      "1px solid rgba(255,255,255,0.05)",
          }}>
            {/* IDLE / ENDED → Start Call */}
            {(isIdle || isEnded) && (
              <button
                onClick={() => void startCall()}
                disabled={!supported}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            9,
                  background:     "linear-gradient(135deg,#F26522,#D4541A)",
                  color:          "#fff",
                  border:         "none",
                  borderRadius:   99,
                  padding:        "13px 30px",
                  fontSize:       14,
                  fontWeight:     700,
                  cursor:         supported ? "pointer" : "not-allowed",
                  opacity:        supported ? 1 : 0.5,
                  boxShadow:      "0 6px 20px rgba(242,101,34,0.45)",
                  transition:     "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform  = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 28px rgba(242,101,34,0.55)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform  = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(242,101,34,0.45)";
                }}
              >
                <Phone size={17} />
                {isEnded ? "Call Again" : "Start Call"}
              </button>
            )}

            {/* RINGING → disabled */}
            {isRinging && (
              <button
                disabled
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          9,
                  background:   "rgba(255,255,255,0.05)",
                  color:        "#555",
                  border:       "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 99,
                  padding:      "13px 30px",
                  fontSize:     14,
                  fontWeight:   700,
                  cursor:       "not-allowed",
                }}
              >
                <Phone size={17} />
                Connecting…
              </button>
            )}

            {/* CONNECTED → Mute + Volume + End */}
            {isConnected && (
              <>
                {/* Mute */}
                <button
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  style={{
                    width:          50,
                    height:         50,
                    borderRadius:   "50%",
                    border:         `2px solid ${isMuted ? "#F26522" : "rgba(255,255,255,0.1)"}`,
                    background:     isMuted ? "rgba(242,101,34,0.15)" : "rgba(255,255,255,0.05)",
                    color:          isMuted ? "#F26522" : "#777",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    cursor:         "pointer",
                    transition:     "all 0.2s ease",
                  }}
                >
                  {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
                </button>

                {/* Volume (decorative indicator) */}
                <div style={{
                  width:          50,
                  height:         50,
                  borderRadius:   "50%",
                  border:         "2px solid rgba(255,255,255,0.07)",
                  background:     "rgba(255,255,255,0.03)",
                  color:          "#444",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}>
                  <Volume2 size={19} />
                </div>

                {/* End call */}
                <button
                  onClick={endCall}
                  title="End call"
                  style={{
                    width:          50,
                    height:         50,
                    borderRadius:   "50%",
                    border:         "none",
                    background:     "linear-gradient(135deg,#ef4444,#b91c1c)",
                    color:          "#fff",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    cursor:         "pointer",
                    boxShadow:      "0 5px 16px rgba(239,68,68,0.45)",
                    transition:     "transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  <PhoneOff size={19} />
                </button>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding:       "8px 24px 16px",
            textAlign:     "center",
            color:         "#333",
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            {process.env.NEXT_PUBLIC_USE_OLLAMA === "true"
              ? "Powered by Ollama · Local & Private"
              : "Powered by Groq · Llama 3"}
            {" · Chrome & Edge only"}
          </div>
        </div>
      )}
    </>
  );
}
