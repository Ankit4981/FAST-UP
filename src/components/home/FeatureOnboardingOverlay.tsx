"use client";

import {
  ArrowRight,
  Bot,
  Calculator,
  ChevronLeft,
  MessageCircle,
  Mic,
  Sparkles,
  Utensils,
  X,
  type LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";

type NutritionValues = {
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
};

type FoodProfile = NutritionValues & {
  label: string;
  aliases: string[];
  serving: string;
  unit: string;
  gramBased?: boolean;
};

type NutritionInsight = {
  food: FoodProfile;
  amountLabel: string;
  totals: NutritionValues;
};

type FeatureSlide = {
  id: "advisor" | "chatbot" | "bmi" | "nutrition";
  title: string;
  summary: string;
  points: string[];
  icon: LucideIcon;
  accent: string;
};

const DEFAULT_FOOD_LOG = "I ate 2 chapatis";

const QUICK_CHAT_PROMPTS = [
  "Help me choose by goal",
  "Compare whey vs plant protein",
  "How should I use this product?"
];

const QUICK_FOOD_LOGS = ["I ate 2 chapatis", "1 bowl dal", "3 eggs", "1 banana", "150g paneer"];

const FOOD_PROFILES: FoodProfile[] = [
  {
    label: "Chapati",
    aliases: ["chapati", "chapatis", "roti", "rotis"],
    serving: "per 1 piece",
    unit: "chapatis",
    protein: 3,
    calories: 120,
    carbs: 18,
    fats: 3
  },
  {
    label: "Rice",
    aliases: ["rice", "bowl rice", "cooked rice"],
    serving: "per 1 bowl",
    unit: "bowls",
    protein: 4,
    calories: 206,
    carbs: 45,
    fats: 0.4
  },
  {
    label: "Dal",
    aliases: ["dal", "lentils", "bowl dal", "dahl"],
    serving: "per 1 bowl",
    unit: "bowls",
    protein: 9,
    calories: 198,
    carbs: 28,
    fats: 4
  },
  {
    label: "Egg",
    aliases: ["egg", "eggs", "boiled egg"],
    serving: "per 1 egg",
    unit: "eggs",
    protein: 6,
    calories: 72,
    carbs: 0.4,
    fats: 5
  },
  {
    label: "Paneer",
    aliases: ["paneer", "cottage cheese"],
    serving: "per 100g",
    unit: "servings",
    gramBased: true,
    protein: 18,
    calories: 265,
    carbs: 4,
    fats: 20
  },
  {
    label: "Chicken Breast",
    aliases: ["chicken", "chicken breast", "grilled chicken"],
    serving: "per 100g",
    unit: "servings",
    gramBased: true,
    protein: 31,
    calories: 165,
    carbs: 0,
    fats: 3.6
  },
  {
    label: "Milk",
    aliases: ["milk", "glass milk"],
    serving: "per 1 glass",
    unit: "glasses",
    protein: 8,
    calories: 150,
    carbs: 12,
    fats: 8
  },
  {
    label: "Oats",
    aliases: ["oats", "oatmeal", "bowl oats"],
    serving: "per 1 bowl",
    unit: "bowls",
    protein: 6,
    calories: 150,
    carbs: 27,
    fats: 3
  },
  {
    label: "Banana",
    aliases: ["banana", "bananas"],
    serving: "per 1 medium banana",
    unit: "bananas",
    protein: 1.3,
    calories: 105,
    carbs: 27,
    fats: 0.3
  },
  {
    label: "Almonds",
    aliases: ["almond", "almonds", "handful almonds"],
    serving: "per 1 handful",
    unit: "handfuls",
    protein: 6,
    calories: 164,
    carbs: 6,
    fats: 14
  },
  {
    label: "Yogurt",
    aliases: ["yogurt", "curd", "dahi"],
    serving: "per 1 cup",
    unit: "cups",
    protein: 10,
    calories: 150,
    carbs: 12,
    fats: 4
  },
  {
    label: "Tofu",
    aliases: ["tofu"],
    serving: "per 100g",
    unit: "servings",
    gramBased: true,
    protein: 8,
    calories: 76,
    carbs: 1.9,
    fats: 4.8
  }
];

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: "advisor",
    title: "AI Advisor",
    summary:
      "A smart assistant that understands user goals and gives personalized guidance in a fast, conversational flow.",
    points: [
      "Suggests products and wellness actions based on user intent",
      "Explains recommendations in plain language",
      "Designed for quick back-and-forth interaction"
    ],
    icon: Bot,
    accent: "from-brand-orange/20 via-orange-500/10 to-transparent"
  },
  {
    id: "chatbot",
    title: "Real-Time Chatbot",
    summary:
      "Users can ask questions, request support, and get quick replies with friendly conversation starters.",
    points: [
      "Live response flow with minimal wait",
      "Friendly message UI with quick prompts",
      "Useful for product help and support questions"
    ],
    icon: MessageCircle,
    accent: "from-sky-500/20 via-cyan-500/10 to-transparent"
  },
  {
    id: "bmi",
    title: "BMI Calculator (Advanced)",
    summary:
      "Calculate BMI using height and weight, then instantly view health category and metabolic insights.",
    points: [
      "Shows BMI and class (Underweight, Normal, Overweight, etc.)",
      "Displays calorie, macro and hydration targets",
      "Connects results to relevant wellness suggestions"
    ],
    icon: Calculator,
    accent: "from-violet-500/20 via-indigo-500/10 to-transparent"
  },
  {
    id: "nutrition",
    title: "Smart Nutrition Tracker",
    summary:
      "Inside the BMI flow, users can log meals in plain text and receive instant nutrition feedback.",
    points: [
      "Recognizes foods from natural phrases",
      "Estimates protein, calories, carbs and fats",
      "Future-ready for voice and AI food recognition"
    ],
    icon: Utensils,
    accent: "from-emerald-500/20 via-lime-500/10 to-transparent"
  }
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractNumber(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) {
    return 1;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function parseFoodLog(log: string): NutritionInsight | null {
  const normalized = normalizeText(log);
  if (!normalized) {
    return null;
  }

  const food = FOOD_PROFILES.find((profile) => profile.aliases.some((alias) => normalized.includes(alias)));
  if (!food) {
    return null;
  }

  const quantity = extractNumber(normalized);
  const gramsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g\b/);
  const gramAmount = gramsMatch ? Number(gramsMatch[1]) : null;

  const multiplier = food.gramBased && gramAmount ? gramAmount / 100 : quantity;
  const amountLabel = food.gramBased && gramAmount ? `${formatValue(gramAmount)}g` : `${formatValue(quantity)} ${food.unit}`;

  return {
    food,
    amountLabel,
    totals: {
      protein: toOneDecimal(food.protein * multiplier),
      calories: toOneDecimal(food.calories * multiplier),
      carbs: toOneDecimal(food.carbs * multiplier),
      fats: toOneDecimal(food.fats * multiplier)
    }
  };
}

function composeProteinFeedback(insight: NutritionInsight | null) {
  if (!insight) {
    return "Try a food log like \"I ate 2 chapatis\" or \"1 bowl dal\" to preview nutrition insights.";
  }

  return `You consumed approximately ${formatValue(insight.totals.protein)}g of protein from ${insight.amountLabel}.`;
}

export function FeatureOnboardingOverlay() {
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [foodLog, setFoodLog] = useState(DEFAULT_FOOD_LOG);
  const [nutritionInsight, setNutritionInsight] = useState<NutritionInsight | null>(() =>
    parseFoodLog(DEFAULT_FOOD_LOG)
  );

  const isLastSlide = slideIndex === FEATURE_SLIDES.length - 1;
  const proteinFeedback = composeProteinFeedback(nutritionInsight);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 260);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "ArrowRight") {
        setSlideIndex((current) => (current + 1) % FEATURE_SLIDES.length);
      }
      if (event.key === "ArrowLeft") {
        setSlideIndex((current) => (current - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function runNutritionPreview(nextLog: string) {
    setFoodLog(nextLog);
    setNutritionInsight(parseFoodLog(nextLog));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[85] inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-orange shadow-lift backdrop-blur-sm transition hover:border-brand-orange hover:bg-white animate-onboarding-pulse"
      >
        <Sparkles size={14} />
        Revisit Feature Guide
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-neutral-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Feature onboarding guide"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(242,101,34,0.24),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(14,165,233,0.22),transparent_38%)]" />

      <div className="relative mx-auto w-full max-w-5xl animate-onboarding-in overflow-hidden rounded-3xl border border-white/35 bg-white/80 shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 px-5 py-4 sm:px-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brand-orange">
              <Sparkles size={14} />
              Latest Platform Features
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Quick interactive walkthrough of AI guidance, chat support, BMI intelligence and smart nutrition logging.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-600 transition hover:border-brand-orange hover:text-brand-orange"
          >
            Skip
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-7 sm:pb-6">
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/70">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
              {FEATURE_SLIDES.map((slide, index) => {
                const Icon = slide.icon;
                const isNutritionSlide = slide.id === "nutrition";

                return (
                  <section key={slide.id} className="w-full shrink-0 px-4 py-5 sm:px-6 sm:py-6">
                    <div className={`rounded-2xl border border-neutral-200 bg-gradient-to-br ${slide.accent} p-4 sm:p-6`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Feature {index + 1}</p>
                          <h3 className="mt-2 font-display text-4xl font-black uppercase leading-[0.9] text-brand-black sm:text-5xl">
                            {slide.title}
                          </h3>
                        </div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-brand-orange">
                          <Icon size={24} />
                        </span>
                      </div>

                      <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700 sm:text-base">{slide.summary}</p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {slide.points.map((point) => (
                          <div key={point} className="rounded-xl border border-white/75 bg-white/80 p-3 text-sm font-medium leading-6 text-neutral-700">
                            {point}
                          </div>
                        ))}
                      </div>

                      {slide.id === "chatbot" ? (
                        <div className="mt-4 rounded-xl border border-white/75 bg-white/85 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Quick response suggestions</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_CHAT_PROMPTS.map((prompt) => (
                              <span key={prompt} className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                                {prompt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {isNutritionSlide ? (
                        <div className="mt-4 rounded-xl border border-white/75 bg-white/85 p-4">
                          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                            <Utensils size={13} />
                            Nutrition log preview
                          </p>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input
                              value={foodLog}
                              onChange={(event) => setFoodLog(event.target.value)}
                              className="field h-11"
                              placeholder="Example: I ate 2 chapatis"
                            />
                            <button type="button" className="btn-primary h-11 px-5" onClick={() => runNutritionPreview(foodLog)}>
                              Analyze Food
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_FOOD_LOGS.map((example) => (
                              <button key={example} type="button" className="chip h-8" onClick={() => runNutritionPreview(example)}>
                                {example}
                              </button>
                            ))}
                          </div>

                          <p className="mt-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-brand-black">
                            {proteinFeedback}
                          </p>

                          {nutritionInsight ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-4">
                              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Protein</p>
                                <p className="text-sm font-bold text-brand-black">{formatValue(nutritionInsight.totals.protein)}g</p>
                              </div>
                              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Calories</p>
                                <p className="text-sm font-bold text-brand-black">{formatValue(nutritionInsight.totals.calories)}</p>
                              </div>
                              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Carbs</p>
                                <p className="text-sm font-bold text-brand-black">{formatValue(nutritionInsight.totals.carbs)}g</p>
                              </div>
                              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Fats</p>
                                <p className="text-sm font-bold text-brand-black">{formatValue(nutritionInsight.totals.fats)}g</p>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-neutral-500">
                              Supported examples: chapati, rice, dal, egg, paneer, chicken, milk, oats, banana, almonds, yogurt, tofu.
                            </p>
                          )}

                          <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                            <Mic size={14} className="text-brand-orange" />
                            Optional next step: enable voice input and AI food recognition.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {FEATURE_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition ${
                    slideIndex === index ? "w-7 bg-brand-orange" : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-secondary h-10 px-4"
                onClick={() => setSlideIndex((current) => (current - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length)}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                type="button"
                className="btn-primary h-10 px-5"
                onClick={() => {
                  if (isLastSlide) {
                    setOpen(false);
                    return;
                  }
                  setSlideIndex((current) => (current + 1) % FEATURE_SLIDES.length);
                }}
              >
                {isLastSlide ? "Explore Now" : "Next Feature"}
                <ArrowRight size={16} />
              </button>
              <button type="button" className="btn-ghost h-10 px-4" onClick={() => setOpen(false)}>
                Get Started
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-neutral-500">Use Left/Right arrow keys to move between cards. Press Esc to close.</p>
        </div>
      </div>
    </div>
  );
}