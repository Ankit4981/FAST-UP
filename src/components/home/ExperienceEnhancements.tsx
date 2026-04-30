"use client";

import {
  ArrowRight,
  Layers3,
  Medal,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { formatPrice, getDiscount } from "@/lib/utils";
import type { ChatMessage, Product } from "@/types";

type GoalKey = "weight_loss" | "muscle_gain" | "energy_hydration" | "immunity";
type BudgetTier = "value" | "balanced" | "premium";

type CalculatorSnapshot = {
  goal?: GoalKey;
  diet?: string;
  activity?: string;
  weightKg?: number;
  updatedAt?: string;
};

type StreakState = {
  lastVisit: string;
  streakDays: number;
  points: number;
};

type QuizAnswers = {
  goal?: GoalKey;
  budget?: BudgetTier;
  activity?: "light" | "moderate" | "intense";
  priority?: "hydration" | "muscle" | "immunity";
};

type SeasonTheme = {
  name: string;
  accentClass: string;
  hint: string;
};

const CHAT_HISTORY_KEY = "fastandup-rule-chat-history";
const CALCULATOR_PROFILE_KEY = "fastup-health-calculator-profile-v1";
const STREAK_STORAGE_KEY = "fastup-loyalty-streak-v1";

const GOAL_LABELS: Record<GoalKey, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  energy_hydration: "Energy & Hydration",
  immunity: "Immunity",
};

const BUDGET_LABELS: Record<BudgetTier, string> = {
  value: "Value for Money",
  balanced: "Balanced",
  premium: "Premium",
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function parseProteinGrams(product: Product) {
  const text = [...product.nutrition, product.description, product.longDescription].join(" ");
  const match = text.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
  return match ? Number(match[1]) : 0;
}

function getSeasonTheme(date: Date): SeasonTheme {
  const month = date.getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) {
    return {
      name: "Spring Energy",
      accentClass: "from-emerald-500/15 via-lime-500/10 to-transparent",
      hint: "Fresh season focus: hydration + recovery consistency.",
    };
  }
  if (month >= 5 && month <= 7) {
    return {
      name: "Monsoon Active",
      accentClass: "from-sky-500/15 via-cyan-500/10 to-transparent",
      hint: "Monsoon mode: immunity support and daily electrolytes.",
    };
  }
  if (month >= 8 && month <= 10) {
    return {
      name: "Festive Boost",
      accentClass: "from-brand-orange/20 via-amber-400/12 to-transparent",
      hint: "Festive boost: energy balance and smart stack choices.",
    };
  }
  return {
    name: "Winter Strength",
    accentClass: "from-violet-500/15 via-indigo-500/10 to-transparent",
    hint: "Winter strength: recovery, immunity, and routine discipline.",
  };
}

function inferGoalFromText(text: string): GoalKey | null {
  const normalized = normalizeText(text);
  if (/hydration|electrolyte|endurance|stamina/.test(normalized)) {
    return "energy_hydration";
  }
  if (/muscle|whey|protein|strength|gym|recovery/.test(normalized)) {
    return "muscle_gain";
  }
  if (/immunity|vitamin|wellness|daily/.test(normalized)) {
    return "immunity";
  }
  if (/weight|fat|lean|calorie/.test(normalized)) {
    return "weight_loss";
  }
  return null;
}

function inferBudgetFromText(text: string): BudgetTier | null {
  const normalized = normalizeText(text);
  if (/premium|top performance|high quality|best quality/.test(normalized)) {
    return "premium";
  }
  if (/value|affordable|budget|cheap|low price/.test(normalized)) {
    return "value";
  }
  return null;
}

function scoreProductForGoal(product: Product, goal: GoalKey) {
  const signals = [product.name, product.description, ...product.tags, ...product.goalTags]
    .join(" ")
    .toLowerCase();

  if (goal === "energy_hydration") {
    return /hydration|electrolyte|endurance|reload/.test(signals) ? 34 : 8;
  }
  if (goal === "muscle_gain") {
    return /whey|protein|muscle|strength|recovery|bcaa/.test(signals) ? 34 : 8;
  }
  if (goal === "immunity") {
    return /immunity|vitamin|zinc|daily/.test(signals) ? 34 : 8;
  }
  if (goal === "weight_loss") {
    return /lean|weight|metabolism|hydration/.test(signals) ? 30 : 8;
  }
  return 10;
}

function scoreProductForBudget(product: Product, budget: BudgetTier, minPrice: number, maxPrice: number) {
  const spread = Math.max(1, maxPrice - minPrice);
  const normalized = (product.price - minPrice) / spread;

  if (budget === "value") {
    return Math.round((1 - normalized) * 28);
  }
  if (budget === "premium") {
    const premiumSignal = /premium|whey|performance|top/i.test(
      [product.name, ...product.tags, product.badge ?? ""].join(" ")
    )
      ? 8
      : 0;
    return Math.round(normalized * 24) + premiumSignal;
  }

  // balanced
  const centerDistance = Math.abs(normalized - 0.52);
  return Math.round((1 - centerDistance) * 24);
}

function getBestProduct(products: Product[], goal: GoalKey, budget: BudgetTier) {
  if (products.length === 0) return null;
  const prices = products.map((product) => product.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const ranked = [...products]
    .map((product) => {
      const goalScore = scoreProductForGoal(product, goal);
      const budgetScore = scoreProductForBudget(product, budget, minPrice, maxPrice);
      const ratingScore = Math.round(product.rating * 6);
      const reviewScore = Math.min(20, Math.round(product.reviewCount / 350));
      const total = goalScore + budgetScore + ratingScore + reviewScore;
      return { product, total };
    })
    .sort((a, b) => b.total - a.total);

  return ranked[0]?.product ?? null;
}

function getGoalBundles(products: Product[], goal: GoalKey) {
  const ranked = [...products]
    .map((product) => ({
      product,
      score: scoreProductForGoal(product, goal) + Math.round(product.rating * 5),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);

  const primary = ranked[0];
  const support = ranked.find((product) => product.id !== primary?.id);
  const addOn = ranked.find((product) => product.id !== primary?.id && product.id !== support?.id);
  const picks = [primary, support, addOn].filter(Boolean) as Product[];

  if (picks.length === 0) {
    return null;
  }

  const subtotal = picks.reduce((sum, item) => sum + item.price, 0);
  const original = picks.reduce((sum, item) => sum + item.mrp, 0);
  const bundlePrice = Math.max(0, Math.round(subtotal * 0.92));
  const savings = Math.max(0, original - bundlePrice);

  return {
    goal,
    picks,
    original,
    bundlePrice,
    savings,
    title:
      goal === "muscle_gain"
        ? "Muscle Performance Stack"
        : goal === "energy_hydration"
        ? "Hydration Endurance Stack"
        : goal === "immunity"
        ? "Daily Immunity Stack"
        : "Lean Routine Stack",
  };
}

function getPersonalizedProducts(
  products: Product[],
  goal: GoalKey,
  budget: BudgetTier,
  count = 4
) {
  const prices = products.map((product) => product.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return [...products]
    .map((product) => {
      const score =
        scoreProductForGoal(product, goal) +
        scoreProductForBudget(product, budget, minPrice, maxPrice) +
        Math.round(product.rating * 6);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.product);
}

function getDailySocialProof(products: Product[]) {
  const topByReviews = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
  const topByRating = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3);
  return {
    topByReviews,
    topByRating,
    activeShoppers: 1200 + (new Date().getDate() % 17) * 73,
    cartsToday: 340 + (new Date().getDate() % 12) * 29,
  };
}

export function ExperienceEnhancements({ products }: { products: Product[] }) {
  const seasonTheme = useMemo(() => getSeasonTheme(new Date()), []);
  const socialProof = useMemo(() => getDailySocialProof(products), [products]);

  const [selectedGoal, setSelectedGoal] = useState<GoalKey>("energy_hydration");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("balanced");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [streak, setStreak] = useState<StreakState>({
    lastVisit: "",
    streakDays: 1,
    points: 20,
  });

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizStep, setQuizStep] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(60);

  const quizDone = quizStep >= 4;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ux-revealed");
          }
        });
      },
      { threshold: 0.15 }
    );

    const nodes = document.querySelectorAll("[data-ux-reveal]");
    nodes.forEach((node) => {
      node.classList.add("ux-reveal");
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = window.localStorage.getItem(STREAK_STORAGE_KEY);
    let nextState: StreakState;

    if (!saved) {
      nextState = { lastVisit: today, streakDays: 1, points: 20 };
    } else {
      try {
        const parsed = JSON.parse(saved) as StreakState;
        const last = new Date(parsed.lastVisit);
        const current = new Date(today);
        const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          nextState = parsed;
        } else if (diffDays === 1) {
          nextState = {
            lastVisit: today,
            streakDays: parsed.streakDays + 1,
            points: parsed.points + 12,
          };
        } else {
          nextState = {
            lastVisit: today,
            streakDays: 1,
            points: parsed.points + 8,
          };
        }
      } catch {
        nextState = { lastVisit: today, streakDays: 1, points: 20 };
      }
    }

    setStreak(nextState);
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(nextState));
  }, []);

  useEffect(() => {
    const applyInferredState = () => {
      const chatHistoryRaw = window.localStorage.getItem(CHAT_HISTORY_KEY);
      const calculatorRaw = window.localStorage.getItem(CALCULATOR_PROFILE_KEY);

      let inferredGoal: GoalKey | null = null;
      let inferredBudget: BudgetTier | null = null;

      if (calculatorRaw) {
        try {
          const profile = JSON.parse(calculatorRaw) as CalculatorSnapshot;
          if (profile.goal) {
            inferredGoal = profile.goal;
          }
        } catch {
          // no-op
        }
      }

      if (chatHistoryRaw) {
        try {
          const messages = JSON.parse(chatHistoryRaw) as ChatMessage[];
          const userText = messages
            .filter((message) => message.role === "user")
            .slice(-12)
            .map((message) => message.content)
            .join(" ");

          const goalFromChat = inferGoalFromText(userText);
          const budgetFromChat = inferBudgetFromText(userText);

          if (!inferredGoal && goalFromChat) {
            inferredGoal = goalFromChat;
          }
          if (budgetFromChat) {
            inferredBudget = budgetFromChat;
          }
        } catch {
          // no-op
        }
      }

      if (inferredGoal) {
        setSelectedGoal(inferredGoal);
      }
      if (inferredBudget) {
        setBudgetTier(inferredBudget);
      }
    };

    applyInferredState();
    window.addEventListener("fastup:profile-updated", applyInferredState as EventListener);
    return () => {
      window.removeEventListener("fastup:profile-updated", applyInferredState as EventListener);
    };
  }, []);

  useEffect(() => {
    if (quizDone || quizTimeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setQuizTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [quizDone, quizTimeLeft]);

  useEffect(() => {
    if (quizTimeLeft > 0 || quizDone) {
      return;
    }
    setQuizStep(4);
  }, [quizDone, quizTimeLeft]);

  const bestPick = useMemo(
    () => getBestProduct(products, selectedGoal, budgetTier),
    [products, selectedGoal, budgetTier]
  );

  const personalized = useMemo(
    () => getPersonalizedProducts(products, selectedGoal, budgetTier, 4),
    [products, selectedGoal, budgetTier]
  );

  const smartBundle = useMemo(
    () => getGoalBundles(products, selectedGoal),
    [products, selectedGoal]
  );

  const compareProducts = useMemo(
    () => products.filter((product) => compareIds.includes(product.id)),
    [compareIds, products]
  );
  const compareCandidates = useMemo(() => {
    const pool: Product[] = [];

    if (bestPick) {
      pool.push(bestPick);
    }

    personalized.forEach((product) => {
      if (!pool.some((item) => item.id === product.id)) {
        pool.push(product);
      }
    });

    products.forEach((product) => {
      if (pool.length >= 4) return;
      if (!pool.some((item) => item.id === product.id)) {
        pool.push(product);
      }
    });

    return pool.slice(0, 4);
  }, [bestPick, personalized, products]);

  const quizGoal = quizAnswers.goal ?? selectedGoal;
  const quizBudget = quizAnswers.budget ?? budgetTier;
  const quizPick = useMemo(
    () => getBestProduct(products, quizGoal, quizBudget),
    [products, quizGoal, quizBudget]
  );

  const pointsToNextReward = Math.max(0, 500 - (streak.points % 500));

  function toggleCompare(productId: string) {
    setCompareIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (current.length >= 3) {
        return [...current.slice(1), productId];
      }
      return [...current, productId];
    });
  }

  function applyQuizAnswer(answer: QuizAnswers[keyof QuizAnswers]) {
    if (quizDone) return;
    if (quizStep === 0) {
      setQuizAnswers((current) => ({ ...current, goal: answer as GoalKey }));
    } else if (quizStep === 1) {
      setQuizAnswers((current) => ({ ...current, budget: answer as BudgetTier }));
    } else if (quizStep === 2) {
      setQuizAnswers((current) => ({ ...current, activity: answer as QuizAnswers["activity"] }));
    } else if (quizStep === 3) {
      setQuizAnswers((current) => ({ ...current, priority: answer as QuizAnswers["priority"] }));
    }
    setQuizStep((current) => Math.min(4, current + 1));
  }

  function restartQuiz() {
    setQuizAnswers({});
    setQuizStep(0);
    setQuizTimeLeft(60);
  }

  function openCompareDrawer() {
    if (compareCandidates.length === 0) {
      setCompareOpen(true);
      return;
    }

    setCompareIds((current) => {
      if (current.length > 0) {
        return current;
      }
      return compareCandidates.slice(0, 2).map((product) => product.id);
    });

    setCompareOpen(true);
  }

  return (
    <>
      <section className="section-shell bg-white" aria-label="Creative Experience Upgrades">
        <div className="container-page">
            <div
            data-ux-reveal
            style={{ "--ux-delay": "0ms" } as CSSProperties}
            className={`rounded-2xl border border-neutral-200 bg-gradient-to-br ${seasonTheme.accentClass} p-4 sm:p-6`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Creative Experience Upgrades</p>
                <h2 className="mt-3 font-display text-4xl font-black uppercase leading-[0.92] text-brand-black sm:text-5xl">
                  Smarter, richer, more personal shopping
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
                  Added: best-pick intelligence, compare drawer, personalization, social proof,
                  smart bundles, faster quiz, better chat follow-ups, loyalty streaks, and seasonal dynamic accents.
                </p>
              </div>
              <div className="rounded-xl border border-brand-orange/25 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-orange">
                  {seasonTheme.name}
                </p>
                <p className="mt-1 text-xs text-neutral-600">{seasonTheme.hint}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article
              data-ux-reveal
              style={{ "--ux-delay": "80ms" } as CSSProperties}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                  <Sparkles size={14} />
                  1. Smart Best Pick
                </p>
                <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-[11px] font-black uppercase text-brand-orange">
                  Goal + Budget AI
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="compact-label">
                  Goal
                  <select
                    className="field mt-1"
                    value={selectedGoal}
                    onChange={(event) => setSelectedGoal(event.target.value as GoalKey)}
                  >
                    {Object.entries(GOAL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="compact-label">
                  Budget
                  <select
                    className="field mt-1"
                    value={budgetTier}
                    onChange={(event) => setBudgetTier(event.target.value as BudgetTier)}
                  >
                    {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {bestPick ? (
                <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500">
                        Best Pick For You
                      </p>
                      <h3 className="mt-1 font-display text-3xl font-black uppercase leading-none text-brand-black">
                        {bestPick.name}
                      </h3>
                    </div>
                    <span className="rounded-full bg-brand-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {GOAL_LABELS[selectedGoal]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{bestPick.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl font-black text-brand-black">
                      {formatPrice(bestPick.price)}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">{formatPrice(bestPick.mrp)}</span>
                    <span className="rounded-full bg-brand-green/10 px-2 py-1 text-[11px] font-bold text-brand-green">
                      {getDiscount(bestPick.price, bestPick.mrp)}% OFF
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/products/${bestPick.slug}`} className="btn-primary">
                      View Best Pick
                      <ArrowRight size={16} />
                    </Link>
                    <button type="button" className="btn-secondary" onClick={() => toggleCompare(bestPick.id)}>
                      {compareIds.includes(bestPick.id) ? "Remove Compare" : "Add to Compare"}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>

            <article
              data-ux-reveal
              style={{ "--ux-delay": "130ms" } as CSSProperties}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                <Medal size={14} />
                5. Social Proof Strip
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Most bought today</p>
                  <p className="mt-1 text-sm font-semibold text-brand-black">{socialProof.topByReviews[0]?.name}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Top rated now</p>
                  <p className="mt-1 text-sm font-semibold text-brand-black">{socialProof.topByRating[0]?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Active shoppers</p>
                    <p className="mt-1 font-display text-3xl font-black text-brand-black">{socialProof.activeShoppers}+</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Carts today</p>
                    <p className="mt-1 font-display text-3xl font-black text-brand-black">{socialProof.cartsToday}+</p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article
              data-ux-reveal
              style={{ "--ux-delay": "180ms" } as CSSProperties}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                  <TrendingUp size={14} />
                  3. Personalized Home Section
                </p>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Based on chat + calculator
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {personalized.map((product) => (
                  <div key={product.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <p className="font-semibold text-brand-black">{product.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">{product.goalTags.slice(0, 2).join(" • ")}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-display text-2xl font-black text-brand-black">
                        {formatPrice(product.price)}
                      </span>
                      <button type="button" className="chip" onClick={() => toggleCompare(product.id)}>
                        {compareIds.includes(product.id) ? "Compared" : "Compare"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article
              data-ux-reveal
              style={{ "--ux-delay": "240ms" } as CSSProperties}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                <Trophy size={14} />
                9. Loyalty & Streaks
              </p>
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Weekly streak</p>
                <p className="mt-1 font-display text-5xl font-black uppercase text-brand-black">
                  {streak.streakDays}
                  <span className="text-2xl text-neutral-400"> days</span>
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Reward points: <span className="font-bold text-brand-black">{streak.points}</span>
                </p>
                <div className="mt-3 h-2 rounded-full bg-neutral-200">
                  <div
                    className="h-2 rounded-full bg-brand-orange transition-all duration-700"
                    style={{ width: `${Math.max(10, ((500 - pointsToNextReward) / 500) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {pointsToNextReward} points left for your next reward badge.
                </p>
              </div>
            </article>
          </div>

          <article
            data-ux-reveal
            style={{ "--ux-delay": "300ms" } as CSSProperties}
            className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                <Layers3 size={14} />
                7. Smart Bundle Suggestions
              </p>
              <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand-orange">
                Auto-created by goal
              </span>
            </div>

            {smartBundle ? (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-3xl font-black uppercase leading-none text-brand-black">
                      {smartBundle.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Optimized for {GOAL_LABELS[smartBundle.goal]} with auto savings.
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-green/10 px-3 py-1 text-sm font-bold text-brand-green">
                    Save {formatPrice(smartBundle.savings)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {smartBundle.picks.map((product) => (
                    <div key={product.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                      <p className="font-semibold text-brand-black">{product.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{product.category}</p>
                      <p className="mt-2 font-bold text-brand-black">{formatPrice(product.price)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-neutral-500 line-through">{formatPrice(smartBundle.original)}</span>
                  <span className="font-display text-3xl font-black text-brand-black">
                    {formatPrice(smartBundle.bundlePrice)}
                  </span>
                  <Link href="/products?category=Bundles" className="btn-primary ml-auto">
                    Explore Bundles
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : null}
          </article>

          <article
            data-ux-reveal
            style={{ "--ux-delay": "360ms" } as CSSProperties}
            className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                <Zap size={14} />
                6. Interactive Goal Quiz (60s)
              </p>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                {quizTimeLeft}s left
              </span>
            </div>

            {!quizDone ? (
              <div className="mt-4">
                {quizStep === 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-brand-black">What is your main goal?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(GOAL_LABELS).map(([goal, label]) => (
                        <button key={goal} type="button" className="chip" onClick={() => applyQuizAnswer(goal as GoalKey)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {quizStep === 1 ? (
                  <div>
                    <p className="text-sm font-semibold text-brand-black">Which budget style fits you?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(BUDGET_LABELS).map(([budget, label]) => (
                        <button key={budget} type="button" className="chip" onClick={() => applyQuizAnswer(budget as BudgetTier)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {quizStep === 2 ? (
                  <div>
                    <p className="text-sm font-semibold text-brand-black">How intense is your weekly activity?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["light", "moderate", "intense"].map((level) => (
                        <button key={level} type="button" className="chip" onClick={() => applyQuizAnswer(level as QuizAnswers["activity"])}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {quizStep === 3 ? (
                  <div>
                    <p className="text-sm font-semibold text-brand-black">What is your current top priority?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { id: "hydration", label: "Hydration" },
                        { id: "muscle", label: "Muscle" },
                        { id: "immunity", label: "Immunity" },
                      ].map((priority) => (
                        <button
                          key={priority.id}
                          type="button"
                          className="chip"
                          onClick={() => applyQuizAnswer(priority.id as QuizAnswers["priority"])}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Quiz result</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Goal: <span className="font-bold text-brand-black">{GOAL_LABELS[quizGoal]}</span> • Budget:{" "}
                  <span className="font-bold text-brand-black">{BUDGET_LABELS[quizBudget]}</span>
                </p>
                {quizPick ? (
                  <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-3">
                    <p className="font-semibold text-brand-black">Top suggested: {quizPick.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">{quizPick.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-display text-2xl font-black text-brand-black">
                        {formatPrice(quizPick.price)}
                      </span>
                      <Link href={`/products/${quizPick.slug}`} className="btn-secondary h-8 px-3 text-xs">
                        View
                      </Link>
                    </div>
                  </div>
                ) : null}
                <button type="button" className="btn-ghost mt-3 h-9 px-4" onClick={restartQuiz}>
                  Restart Quiz
                </button>
              </div>
            )}
          </article>

          <article
            data-ux-reveal
            style={{ "--ux-delay": "420ms" } as CSSProperties}
            className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-brand-orange">
                <ShieldCheck size={14} />
                2. Compare Drawer • 4. Micro Animations • 8. Better Chat UX • 10. Seasonal Theme
              </p>
              <button type="button" className="btn-secondary" onClick={openCompareDrawer}>
                Open Compare ({compareIds.length})
              </button>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-neutral-500">
                Quick add for compare
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {compareCandidates.slice(0, 4).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`chip ${
                      compareIds.includes(product.id)
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : ""
                    }`}
                    onClick={() => toggleCompare(product.id)}
                  >
                    {compareIds.includes(product.id) ? "Compared: " : "Compare: "}
                    {product.name}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {compareIds.length < 2
                  ? "Select at least 2 products for side-by-side comparison."
                  : "Ready. Open compare to view side-by-side details."}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Compare Drawer</p>
                <p className="mt-1 text-sm text-neutral-600">Side-by-side compare for price, protein, benefits, and usage.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Micro Animations</p>
                <p className="mt-1 text-sm text-neutral-600">Staggered reveal animations for sections and cards to improve flow.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Chat UX + Season</p>
                <p className="mt-1 text-sm text-neutral-600">Context memory and follow-up chips, with dynamic seasonal accenting.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {compareOpen ? (
        <>
          <button
            type="button"
            aria-label="Close compare drawer backdrop"
            onClick={() => setCompareOpen(false)}
            className="fixed inset-0 z-[94] bg-black/40"
          />
          <aside className="fixed right-0 top-0 z-[95] h-full w-full max-w-3xl overflow-y-auto border-l border-neutral-200 bg-white shadow-lift">
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-3xl font-black uppercase text-brand-black">Product Compare</h3>
                <button type="button" className="btn-secondary h-9 px-3" onClick={() => setCompareOpen(false)}>
                  Close
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Compare up to 3 products side-by-side.</p>
            </div>

            {compareProducts.length === 0 ? (
              <div className="p-6">
                <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                  <p className="font-semibold text-brand-black">No products selected for comparison.</p>
                  <p className="mt-2 text-sm text-neutral-500">Use compare chips below to add products.</p>
                  {compareCandidates.length > 0 ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {compareCandidates.slice(0, 4).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="chip"
                          onClick={() => toggleCompare(product.id)}
                        >
                          Compare {product.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${compareProducts.length}, minmax(0,1fr))` }}>
                  {compareProducts.map((product) => (
                    <div key={product.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <p className="font-semibold text-brand-black">{product.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{product.category}</p>
                      <button type="button" className="mt-3 text-xs font-bold text-brand-orange" onClick={() => toggleCompare(product.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <tbody>
                      {[
                        {
                          label: "Price",
                          render: (product: Product) => formatPrice(product.price),
                        },
                        {
                          label: "Protein",
                          render: (product: Product) => {
                            const grams = parseProteinGrams(product);
                            return grams > 0 ? `${grams}g` : "As per label";
                          },
                        },
                        {
                          label: "Benefits",
                          render: (product: Product) => product.goalTags.slice(0, 3).join(", "),
                        },
                        {
                          label: "How to use",
                          render: (product: Product) => product.howToUse,
                        },
                      ].map((row) => (
                        <tr key={row.label} className="border-t border-neutral-200">
                          <th className="w-36 bg-neutral-50 px-3 py-3 text-left text-xs font-black uppercase tracking-wider text-neutral-500">
                            {row.label}
                          </th>
                          {compareProducts.map((product) => (
                            <td key={`${row.label}-${product.id}`} className="px-3 py-3 align-top text-neutral-700">
                              {row.render(product)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </aside>
        </>
      ) : null}
    </>
  );
}
