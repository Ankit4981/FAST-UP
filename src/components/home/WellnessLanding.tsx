"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  Calculator,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Leaf,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { AosInit } from "@/components/home/AosInit";
import {
  activityMeta,
  calculateHealthReport,
  createProgressInsight,
  getAchievementBadges,
  getDefaultHealthInputs,
  goalMeta,
  recommendSupplements,
  routeLeadByGoal,
  type ActivityLevel,
  type DietPreference,
  type Gender,
  type GoalKey,
  type HealthInputs,
  type SavedHealthSnapshot,
  type SupplementMatch
} from "@/lib/wellnessEngine";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type WellnessLandingProps = {
  products: Product[];
};

type ChatRow = {
  role: "assistant" | "user";
  content: string;
};

type LeadForm = {
  name: string;
  phone: string;
  goal: GoalKey;
  intent: string;
};

type LeadEntry = LeadForm & {
  id: string;
  queue: string;
  team: string;
  createdAt: string;
};

type QuizStepId = "goal" | "age" | "gender" | "activity" | "diet";

type QuizAnswers = {
  goal: GoalKey;
  age: string;
  gender: Gender;
  activity: ActivityLevel;
  diet: DietPreference;
};

const REPORT_STORAGE_KEY = "fastup-health-reports-v1";
const LEAD_STORAGE_KEY = "fastup-lead-captures-v1";

const goalCards: Array<{
  id: GoalKey;
  title: string;
  blurb: string;
  icon: typeof Flame;
  benefit: string;
}> = [
  {
    id: "weight_loss",
    title: "Weight Loss",
    blurb: "Control calories, protect energy and avoid muscle drop.",
    icon: Flame,
    benefit: "Lean plan + low-friction adherence"
  },
  {
    id: "muscle_gain",
    title: "Muscle Gain",
    blurb: "Build strength with protein, recovery and training fuel.",
    icon: Dumbbell,
    benefit: "Performance stack for growth"
  },
  {
    id: "energy_hydration",
    title: "Energy & Hydration",
    blurb: "Sustain stamina, reduce cramps and recover faster.",
    icon: Droplets,
    benefit: "Endurance support and electrolyte balance"
  },
  {
    id: "immunity",
    title: "Immunity",
    blurb: "Daily resilience and micronutrient consistency.",
    icon: ShieldCheck,
    benefit: "Strong daily wellness routine"
  }
];

const activityOptions: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "athlete"
];

const dietOptions: Array<{ value: DietPreference; label: string }> = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-Vegetarian" }
];

const quizSteps: Array<{
  id: QuizStepId;
  question: string;
  options: Array<{ label: string; value: string; hint: string }>;
}> = [
  {
    id: "goal",
    question: "What is your primary goal right now?",
    options: goalCards.map((goal) => ({
      label: goal.title,
      value: goal.id,
      hint: goal.benefit
    }))
  },
  {
    id: "age",
    question: "Select your age range",
    options: [
      { label: "18-24", value: "18-24", hint: "Early performance phase" },
      { label: "25-34", value: "25-34", hint: "High output lifestyle" },
      { label: "35-44", value: "35-44", hint: "Recovery + consistency" },
      { label: "45+", value: "45+", hint: "Energy + protective support" }
    ]
  },
  {
    id: "gender",
    question: "Your gender helps estimate BMR and body composition",
    options: [
      { label: "Male", value: "male", hint: "Higher baseline calorie burn" },
      { label: "Female", value: "female", hint: "Hormonal and recovery sensitive" },
      { label: "Prefer not to say", value: "other", hint: "Neutral estimation" }
    ]
  },
  {
    id: "activity",
    question: "How active are you in a typical week?",
    options: [
      { label: "Sedentary", value: "sedentary", hint: "Mostly desk routine" },
      { label: "Light", value: "light", hint: "2-3 light sessions" },
      { label: "Moderate", value: "moderate", hint: "Regular exercise" },
      { label: "Active", value: "active", hint: "Frequent intense sessions" },
      { label: "Athlete", value: "athlete", hint: "Competition-level output" }
    ]
  },
  {
    id: "diet",
    question: "Choose your diet preference",
    options: [
      { label: "Vegan", value: "vegan", hint: "Plant-forward ingredients" },
      { label: "Vegetarian", value: "vegetarian", hint: "Dairy allowed" },
      { label: "Non-Vegetarian", value: "non_vegetarian", hint: "No restrictions" }
    ]
  }
];

const ageToYears: Record<string, number> = {
  "18-24": 22,
  "25-34": 29,
  "35-44": 39,
  "45+": 49
};

const microTips = [
  {
    title: "Hydration Timing",
    text: "Electrolytes perform best when taken 20 minutes before intense sessions and during long workouts.",
    icon: Droplets
  },
  {
    title: "Protein Window",
    text: "Take whey or plant protein within 60 minutes post-training for better muscle repair response.",
    icon: Dumbbell
  },
  {
    title: "Immunity Layering",
    text: "Pair vitamin C and zinc with sleep consistency for stronger immunity outcomes.",
    icon: Leaf
  },
  {
    title: "Recovery Priority",
    text: "If soreness lasts more than 48 hours, prioritize recovery formulas over adding training intensity.",
    icon: HeartPulse
  }
];

const trustSignals = [
  "4.7+ average rating across hero products",
  "GMP-grade manufacturing standards",
  "Trusted by athletes and active professionals",
  "Transparent ingredient labels"
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function goalFromProduct(product: Product): GoalKey {
  const text = `${product.name} ${product.goalTags.join(" ")} ${product.tags.join(" ")}`.toLowerCase();

  if (/muscle|protein|strength|recovery/.test(text)) {
    return "muscle_gain";
  }

  if (/immunity|vitamin|daily|wellness/.test(text)) {
    return "immunity";
  }

  if (/weight|lean|metabolism/.test(text)) {
    return "weight_loss";
  }

  return "energy_hydration";
}

function sanitizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function WellnessLanding({ products }: WellnessLandingProps) {
  const defaultInputs = useMemo(() => getDefaultHealthInputs("energy_hydration"), []);

  const [selectedGoal, setSelectedGoal] = useState<GoalKey>("energy_hydration");
  const [inputs, setInputs] = useState<HealthInputs>(defaultInputs);
  const [report, setReport] = useState(() => calculateHealthReport(defaultInputs));
  const [matches, setMatches] = useState<SupplementMatch[]>(() =>
    recommendSupplements(products, defaultInputs, calculateHealthReport(defaultInputs), 3)
  );

  const [savedReports, setSavedReports] = useState<SavedHealthSnapshot[]>([]);
  const [leadEntries, setLeadEntries] = useState<LeadEntry[]>([]);

  const [chatRows, setChatRows] = useState<ChatRow[]>([
    {
      role: "assistant",
      content:
        "I am your Smart Coach. Share your goal and I will recommend the best supplements with reasons."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [callOpen, setCallOpen] = useState(false);
  const [callError, setCallError] = useState("");
  const [callSuccess, setCallSuccess] = useState("");
  const [leadForm, setLeadForm] = useState<LeadForm>({
    name: "",
    phone: "",
    goal: selectedGoal,
    intent: "Need supplement guidance"
  });

  const [quizStepIndex, setQuizStepIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Partial<QuizAnswers>>({ goal: selectedGoal });
  const [quizMatches, setQuizMatches] = useState<SupplementMatch[]>([]);

  useEffect(() => {
    setLeadForm((prev) => ({ ...prev, goal: selectedGoal }));
    setQuizAnswers((prev) => ({ ...prev, goal: selectedGoal }));
  }, [selectedGoal]);

  useEffect(() => {
    const rawReports = window.localStorage.getItem(REPORT_STORAGE_KEY);
    const rawLeads = window.localStorage.getItem(LEAD_STORAGE_KEY);

    if (rawReports) {
      try {
        const parsed = JSON.parse(rawReports) as SavedHealthSnapshot[];
        if (Array.isArray(parsed)) {
          setSavedReports(parsed);
        }
      } catch {
        setSavedReports([]);
      }
    }

    if (rawLeads) {
      try {
        const parsed = JSON.parse(rawLeads) as LeadEntry[];
        if (Array.isArray(parsed)) {
          setLeadEntries(parsed);
        }
      } catch {
        setLeadEntries([]);
      }
    }
  }, []);

  const featuredFocus = useMemo(() => {
    const picks: Product[] = [];
    const patterns = [/reload/i, /whey/i, /vitamin c/i];

    patterns.forEach((pattern) => {
      const found = products.find((product) => pattern.test(product.name));
      if (found) {
        picks.push(found);
      }
    });

    for (const product of products) {
      if (picks.length >= 3) {
        break;
      }
      if (!picks.some((item) => item.id === product.id)) {
        picks.push(product);
      }
    }

    return picks.slice(0, 3);
  }, [products]);

  const progressInsight = useMemo(() => createProgressInsight(savedReports), [savedReports]);
  const badges = useMemo(() => getAchievementBadges(report), [report]);

  const activeQuizStep = quizStepIndex < quizSteps.length ? quizSteps[quizStepIndex] : null;

  function moveGoal(goal: GoalKey) {
    setSelectedGoal(goal);
    setInputs((prev) => ({ ...prev, goal }));

    const target = document.getElementById("smart-calculator");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function runPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextReport = calculateHealthReport(inputs);
    const nextMatches = recommendSupplements(products, inputs, nextReport, 3);

    setReport(nextReport);
    setMatches(nextMatches);
  }

  function saveReport() {
    const snapshot: SavedHealthSnapshot = {
      id: `report_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      goal: inputs.goal,
      bmi: report.bmi,
      calories: report.dailyCalories,
      healthScore: report.healthScore,
      weightKg: inputs.weightKg,
      recommendations: matches.map((match) => ({
        productId: match.product.id,
        name: match.product.name,
        matchScore: match.matchScore
      }))
    };

    const next = [snapshot, ...savedReports].slice(0, 12);
    setSavedReports(next);
    window.localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(next));
    setCallSuccess("Health report saved to your dashboard.");
  }

  async function sendCoachMessage(prefill?: string) {
    const prompt = (prefill ?? chatInput).trim();
    if (!prompt || chatLoading) {
      return;
    }

    const nextRows: ChatRow[] = [...chatRows, { role: "user", content: prompt }];

    setChatRows(nextRows);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextRows.slice(-10).map((row) => ({
            role: row.role,
            content: row.content
          }))
        })
      });

      if (response.ok) {
        const payload = (await response.json()) as { message?: string };
        setChatRows((current) => [
          ...current,
          {
            role: "assistant",
            content:
              payload.message ??
              "I could not fetch a full answer, but I can still help with goal-based supplement matching."
          }
        ]);
      } else {
        setChatRows((current) => [
          ...current,
          {
            role: "assistant",
            content: "I'm sorry, I didn't understand that. Could you please rephrase your question?"
          }
        ]);
      }
    } catch {
      setChatRows((current) => [
        ...current,
        {
          role: "assistant",
          content: "I'm sorry, I didn't understand that. Could you please rephrase your question?"
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function routeLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCallError("");

    const phone = sanitizePhone(leadForm.phone);
    if (phone.length !== 10) {
      setCallError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!leadForm.name.trim()) {
      setCallError("Please add your name before requesting a callback.");
      return;
    }

    const route = routeLeadByGoal(leadForm.goal);

    const newEntry: LeadEntry = {
      ...leadForm,
      phone,
      id: `lead_${Date.now().toString(36)}`,
      queue: route.queue,
      team: route.team,
      createdAt: new Date().toISOString()
    };

    const next = [newEntry, ...leadEntries].slice(0, 24);
    setLeadEntries(next);
    window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(next));

    setCallOpen(false);
    setLeadForm((prev) => ({ ...prev, intent: "Need supplement guidance" }));
    setCallSuccess(`Lead routed to ${route.team} (${route.queue}). ${route.eta}.`);
  }

  function updateQuiz(value: string) {
    if (!activeQuizStep) {
      return;
    }

    const nextAnswers = {
      ...quizAnswers,
      [activeQuizStep.id]: value
    };

    setQuizAnswers(nextAnswers);

    const isFinal = quizStepIndex === quizSteps.length - 1;

    if (!isFinal) {
      setQuizStepIndex((step) => step + 1);
      return;
    }

    const goal = (nextAnswers.goal as GoalKey | undefined) ?? selectedGoal;
    const age = ageToYears[nextAnswers.age as string] ?? 29;
    const gender = (nextAnswers.gender as Gender | undefined) ?? "male";
    const activity = (nextAnswers.activity as ActivityLevel | undefined) ?? "moderate";
    const diet = (nextAnswers.diet as DietPreference | undefined) ?? "vegetarian";

    const quizInputs: HealthInputs = {
      age,
      gender,
      activity,
      diet,
      goal,
      heightCm: gender === "female" ? 164 : 174,
      weightKg:
        goal === "weight_loss"
          ? gender === "female"
            ? 76
            : 84
          : goal === "muscle_gain"
          ? gender === "female"
            ? 63
            : 73
          : 68
    };

    const quizReport = calculateHealthReport(quizInputs);
    const quizRecommendations = recommendSupplements(products, quizInputs, quizReport, 3);

    setQuizMatches(quizRecommendations);
    setQuizStepIndex(quizSteps.length);
  }

  function restartQuiz() {
    setQuizAnswers({ goal: selectedGoal });
    setQuizMatches([]);
    setQuizStepIndex(0);
  }

  const bmiProgress = clampPercent(((report.bmi - 15) / 20) * 100);
  const bodyFatProgress = clampPercent(((report.estimatedBodyFat - 8) / 30) * 100);
  const calorieProgress = clampPercent(((report.dailyCalories - 1200) / 2200) * 100);

  return (
    <>
      <AosInit />

      <section className="relative overflow-hidden bg-[#f8fafc]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(242,101,34,0.12),transparent_44%),radial-gradient(circle_at_90%_8%,rgba(14,165,233,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]" />

        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div data-aos="fade-right">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
                <Sparkles size={14} />
                Personalised Performance Commerce
              </p>
              <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.9] text-brand-black sm:text-6xl lg:text-7xl">
                Find your
                <span className="text-brand-orange"> exact stack</span>
                <br />
                in under 60 seconds.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
                Start with your goal, get a smart health report, compare 2-3 supplements with clear
                reasoning, and move directly to purchase with confidence.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#smart-calculator" className="btn-primary h-11 px-6 text-sm">
                  <Calculator size={17} />
                  Get Your Plan
                </a>
                <a href="#supplement-finder" className="btn-secondary h-11 px-6 text-sm">
                  <Brain size={17} />
                  Find Your Supplement
                </a>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Average completion", value: "48 sec" },
                  { label: "Recommendation confidence", value: "85%+" },
                  { label: "Live guidance", value: "Chat + Call" }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{stat.label}</p>
                    <p className="mt-1 font-display text-3xl font-black uppercase text-brand-black">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div data-aos="fade-left" className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-lift sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Goal-Based Navigation
                </p>
                <Target size={16} className="text-brand-orange" />
              </div>

              <div className="mt-4 grid gap-3">
                {goalCards.map((goal) => {
                  const Icon = goal.icon;
                  const active = selectedGoal === goal.id;

                  return (
                    <button
                      key={goal.id}
                      id={`goal-${goal.id}`}
                      onClick={() => moveGoal(goal.id)}
                      className={`rounded-2xl border p-4 text-left transition duration-200 ${
                        active
                          ? "border-brand-orange bg-brand-orange/10 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-brand-orange/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl font-black uppercase text-brand-black">{goal.title}</p>
                          <p className="mt-1 text-sm text-neutral-600">{goal.blurb}</p>
                          <p className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                            {goal.benefit}
                          </p>
                        </div>
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            active ? "bg-brand-orange text-white" : "bg-neutral-100 text-brand-orange"
                          }`}
                        >
                          <Icon size={18} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="smart-calculator" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <form
            onSubmit={runPlan}
            className="rounded-3xl border border-neutral-200 bg-[#fcfcfd] p-5 shadow-sm sm:p-6"
            data-aos="fade-up"
          >
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                <Calculator size={14} />
                Smart Health Calculator
              </p>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Primary Feature
              </span>
            </div>

            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              BMI, BMR, Calories
              <span className="text-brand-orange"> + Supplement Mapping</span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Every result directly maps to supplements with score, reasoning and conversion CTA.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Age
                <input
                  type="number"
                  min={15}
                  max={85}
                  value={inputs.age}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, age: Number(event.target.value) || prev.age }))
                  }
                  className="field"
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Gender
                <select
                  value={inputs.gender}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, gender: event.target.value as Gender }))
                  }
                  className="field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Height (cm)
                <input
                  type="number"
                  min={120}
                  max={220}
                  value={inputs.heightCm}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, heightCm: Number(event.target.value) || prev.heightCm }))
                  }
                  className="field"
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Weight (kg)
                <input
                  type="number"
                  min={35}
                  max={220}
                  value={inputs.weightKg}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, weightKg: Number(event.target.value) || prev.weightKg }))
                  }
                  className="field"
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Activity Level
                <select
                  value={inputs.activity}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, activity: event.target.value as ActivityLevel }))
                  }
                  className="field"
                >
                  {activityOptions.map((activity) => (
                    <option key={activity} value={activity}>
                      {activityMeta[activity].label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Diet
                <select
                  value={inputs.diet}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, diet: event.target.value as DietPreference }))
                  }
                  className="field"
                >
                  {dietOptions.map((diet) => (
                    <option key={diet.value} value={diet.value}>
                      {diet.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Optional Body Fat %
              <input
                type="number"
                min={5}
                max={55}
                value={inputs.bodyFat ?? ""}
                onChange={(event) =>
                  setInputs((prev) => ({
                    ...prev,
                    bodyFat: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
                className="field mt-1"
                placeholder="Auto-estimated if skipped"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary h-11 px-6">
                <Zap size={17} />
                Get Your Plan
              </button>
              <button type="button" onClick={saveReport} className="btn-secondary h-11 px-6">
                <CheckCircle2 size={17} />
                Save Report
              </button>
            </div>

            <p className="mt-3 text-xs text-neutral-500">
              Goal selected: <strong>{goalMeta[inputs.goal].label}</strong>
            </p>
          </form>

          <div className="grid gap-4" data-aos="fade-up" data-aos-delay="80">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                <div
                  className="mx-auto h-36 w-36 rounded-full p-2"
                  style={{
                    background: `conic-gradient(#f26522 ${report.healthScore * 3.6}deg, #e2e8f0 0deg)`
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                    <p className="font-display text-5xl font-black uppercase text-brand-black">
                      {report.healthScore}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Health Score
                    </p>
                  </div>
                </div>

                <div>
                  <p className="inline-flex rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
                    {report.classification}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-brand-black">
                    Visual Health Report
                  </h3>

                  <div className="mt-4 grid gap-2 text-sm">
                    {[
                      { label: "BMI", value: report.bmi.toFixed(1), width: bmiProgress },
                      {
                        label: "Body Fat",
                        value: `${report.estimatedBodyFat.toFixed(1)}%`,
                        width: bodyFatProgress
                      },
                      {
                        label: "Daily Calories",
                        value: `${report.dailyCalories} kcal`,
                        width: calorieProgress
                      }
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-neutral-500">
                          <span>{row.label}</span>
                          <span>{row.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-brand-orange to-orange-300 transition-all duration-700"
                            style={{ width: `${row.width}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">BMR</p>
                  <p className="font-display text-3xl font-black uppercase text-brand-black">{report.bmr}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Calories</p>
                  <p className="font-display text-3xl font-black uppercase text-brand-black">{report.dailyCalories}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Goal</p>
                  <p className="font-display text-2xl font-black uppercase text-brand-black">
                    {goalMeta[inputs.goal].label}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                  >
                    <Trophy size={13} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-[#fffdfa] p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-3xl font-black uppercase text-brand-black">
                  Personalized Supplement Picks
                </h3>
                <a href="#supplement-finder" className="btn-secondary h-9 px-4 text-xs">
                  Compare More
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="mt-4 grid gap-3">
                {matches.map((match) => (
                  <article key={match.product.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl font-black uppercase leading-none text-brand-black">
                          {match.product.name}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
                          {match.bestFor}
                        </p>
                      </div>
                      <span className="rounded-full bg-brand-black px-3 py-1 text-xs font-bold text-white">
                        {match.matchScore}% match
                      </span>
                    </div>

                    <ul className="mt-3 grid gap-1 text-sm leading-6 text-neutral-600">
                      {match.reasons.map((reason) => (
                        <li key={reason} className="flex gap-2">
                          <CheckCircle2 size={15} className="mt-1 shrink-0 text-brand-orange" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                      <p className="font-display text-3xl font-black uppercase text-brand-black">
                        {formatPrice(match.product.price)}
                      </p>
                      <Link href={`/products/${match.product.slug}`} className="btn-primary h-9 px-4 text-xs">
                        {match.cta}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="supplement-finder" className="bg-brand-grey py-14 sm:py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" data-aos="fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <Brain size={14} />
              AI-Based Recommendation Engine
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              Guided Quiz
              <span className="text-brand-orange"> + Why This Product</span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Input flow: goal, age, gender, activity and diet. Output: ranked products with reasoning,
              match score and conversion CTA.
            </p>

            <div className="mt-5 h-2 rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-brand-orange to-orange-300 transition-all duration-500"
                style={{ width: `${(Math.min(quizStepIndex, quizSteps.length) / quizSteps.length) * 100}%` }}
              />
            </div>

            {activeQuizStep ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                  Step {quizStepIndex + 1} / {quizSteps.length}
                </p>
                <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-brand-black">
                  {activeQuizStep.question}
                </h3>

                <div className="mt-4 grid gap-3">
                  {activeQuizStep.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateQuiz(option.value)}
                      className="rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-brand-orange hover:bg-brand-orange/5"
                    >
                      <p className="font-bold text-brand-black">{option.label}</p>
                      <p className="mt-1 text-sm text-neutral-500">{option.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm text-neutral-600">
                  Quiz complete. Review your comparison cards and start your personalised stack.
                </p>
                <button onClick={restartQuiz} className="btn-secondary mt-4 h-9 px-4 text-xs">
                  Restart Quiz
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" data-aos="fade-up" data-aos-delay="80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-3xl font-black uppercase text-brand-black">
                Product Comparison (Top 3)
              </h3>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Conversion Ready
              </span>
            </div>

            {quizMatches.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {quizMatches.map((match, index) => (
                  <article key={match.product.id} className="rounded-2xl border border-neutral-200 bg-[#fffdfa] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                          Option {index + 1}
                        </p>
                        <p className="font-display text-2xl font-black uppercase leading-none text-brand-black">
                          {match.product.name}
                        </p>
                      </div>
                      <span className="rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white">
                        {match.matchScore}%
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                      {match.bestFor}
                    </p>

                    <div className="mt-2 h-2 rounded-full bg-neutral-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-brand-orange to-orange-300"
                        style={{ width: `${match.matchScore}%` }}
                      />
                    </div>

                    <ul className="mt-3 grid gap-1 text-sm text-neutral-600">
                      {match.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-1 shrink-0 text-brand-orange" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-3xl font-black uppercase text-brand-black">
                        {formatPrice(match.product.price)}
                      </p>
                      <Link href={`/products/${match.product.slug}`} className="btn-primary h-9 px-4 text-xs">
                        Find Your Supplement
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                <p className="font-display text-3xl font-black uppercase text-brand-black">Complete the quiz</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Your personalized comparison appears here with conversion-focused CTAs.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 lg:py-20" id="featured-products">
        <div className="container-page" data-aos="fade-up">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                <Star size={14} />
                Featured Products
              </p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
                Fast&Up Focus Picks
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-neutral-600">
                Benefits-first cards for Fast&Up Reload, Fast&Up Whey Protein and Fast&Up Vitamin C,
                connected directly to the recommendation engine.
              </p>
            </div>
            <a href="#supplement-finder" className="btn-secondary h-10 px-5">
              Open Comparison Engine
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredFocus.map((product) => (
              <article
                key={product.id}
                className="group rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lift"
              >
                <div className="relative overflow-hidden rounded-2xl bg-neutral-100 p-6">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${product.imageAccent}, transparent 62%)`
                    }}
                  />
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="relative mx-auto h-44 w-44 object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <h3 className="font-display text-2xl font-black uppercase leading-none text-brand-black">
                    {product.name}
                  </h3>
                  <span className="rounded-full bg-brand-black px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Best for {goalMeta[goalFromProduct(product)].label}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-neutral-600">{product.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.nutrition.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <p className="font-display text-3xl font-black uppercase text-brand-black">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveGoal(goalFromProduct(product))}
                      className="btn-secondary h-9 px-3 text-xs"
                    >
                      Use In My Plan
                    </button>
                    <Link href={`/products/${product.slug}`} className="btn-primary h-9 px-3 text-xs">
                      Buy Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="smart-chat" className="bg-brand-grey py-14 sm:py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div data-aos="fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <MessageCircle size={14} />
              Smart Chat Assistant
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              Fast guidance,
              <span className="text-brand-orange"> conversion-focused</span>
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-600">
              Ask supplement questions, get clear action steps, and jump directly to calculator,
              recommendation engine, or product pages.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Response target",
                  value: "<2 sec",
                  icon: Activity
                },
                {
                  label: "Generic filler",
                  value: "0%",
                  icon: Target
                },
                {
                  label: "Goal-led replies",
                  value: "Always",
                  icon: Zap
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <Icon size={16} className="text-brand-orange" />
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                      {item.label}
                    </p>
                    <p className="font-display text-3xl font-black uppercase text-brand-black">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Best supplement for muscle gain?",
                "How much protein should I take daily?",
                "Guide me to the health calculator",
                "I want immunity support"
              ].map((prompt) => (
                <button key={prompt} className="chip" onClick={() => void sendCoachMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5" data-aos="fade-up" data-aos-delay="90">
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              {chatRows.map((row, index) => (
                <div
                  key={`${row.role}-${index}`}
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    row.role === "assistant"
                      ? "mr-auto bg-white text-neutral-700"
                      : "ml-auto bg-brand-orange text-white"
                  }`}
                >
                  {row.content}
                </div>
              ))}
              {chatLoading ? (
                <div className="mr-auto max-w-[88%] rounded-2xl bg-white px-3 py-2 text-sm text-neutral-500">
                  Checking your goal and product fit...
                </div>
              ) : null}
            </div>

            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void sendCoachMessage();
              }}
            >
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                className="field"
                placeholder="Ask a supplement question..."
              />
              <button type="submit" className="btn-primary h-10 px-4" disabled={chatLoading}>
                Ask
              </button>
            </form>

            <p className="mt-2 text-xs text-neutral-400">
              Response quality is optimized for clarity and direct buying decisions.
            </p>
          </div>
        </div>
      </section>

      <section id="talk-expert" className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div data-aos="fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <Phone size={14} />
              One-Click Call Agent
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              Talk to Expert
              <span className="text-brand-orange"> with intent routing</span>
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-600">
              Capture user intent before the call, route leads by goal, and prioritize by specialist queue.
            </p>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">Routing Logic</p>
              <div className="mt-3 grid gap-2">
                {goalCards.map((goal) => {
                  const route = routeLeadByGoal(goal.id);
                  return (
                    <div key={goal.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                      <span className="font-semibold text-neutral-700">{goal.title}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                        {route.queue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setCallOpen(true)} className="btn-primary mt-5 h-11 px-6">
              <Phone size={17} />
              Talk To Expert
            </button>
            <a href="tel:+9118001209656" className="btn-secondary ml-3 mt-5 inline-flex h-11 px-6">
              Call Now
            </a>

            {callSuccess ? <p className="mt-3 text-sm font-medium text-brand-green">{callSuccess}</p> : null}
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" data-aos="fade-up" data-aos-delay="90">
            <h3 className="font-display text-3xl font-black uppercase text-brand-black">Lead Queue Snapshot</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Captured leads are stored locally for prototype routing and follow-up simulation.
            </p>

            {leadEntries.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {leadEntries.slice(0, 6).map((lead) => (
                  <article key={lead.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-brand-black">{lead.name}</p>
                      <span className="rounded-full bg-brand-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        {lead.queue}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{lead.intent}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-orange">
                      Routed to {lead.team}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                <p className="text-sm text-neutral-500">No leads captured yet. Use Talk To Expert to test routing.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="health-dashboard" className="bg-brand-grey py-14 sm:py-16 lg:py-20">
        <div className="container-page" data-aos="fade-up">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
                <Trophy size={14} />
                Personal Health Dashboard
              </p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
                Save reports, track progress
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-neutral-600">
                Store health reports, watch score movement, and revisit recommended products.
              </p>
            </div>
            <button onClick={saveReport} className="btn-primary h-10 px-5">
              Save Current Report
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-display text-3xl font-black uppercase text-brand-black">Progress Insights</h3>
              <p className="mt-2 text-sm text-neutral-600">{progressInsight.trend}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Score Delta</p>
                  <p className="font-display text-4xl font-black uppercase text-brand-black">
                    {progressInsight.scoreDelta >= 0 ? "+" : ""}
                    {progressInsight.scoreDelta}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Weight Delta (kg)</p>
                  <p className="font-display text-4xl font-black uppercase text-brand-black">
                    {progressInsight.weightDelta >= 0 ? "+" : ""}
                    {progressInsight.weightDelta}
                  </p>
                </div>
              </div>

              {savedReports.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-neutral-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Latest Recommended</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {savedReports[0].recommendations.slice(0, 3).map((item) => (
                      <span
                        key={item.productId}
                        className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-orange"
                      >
                        {item.name} ({item.matchScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-display text-3xl font-black uppercase text-brand-black">Saved Reports</h3>

              {savedReports.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {savedReports.slice(0, 5).map((saved) => (
                    <article key={saved.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                          {new Date(saved.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                        <span className="rounded-full bg-brand-black px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                          {goalMeta[saved.goal].label}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Score</p>
                          <p className="font-display text-3xl font-black uppercase text-brand-black">{saved.healthScore}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">BMI</p>
                          <p className="font-display text-3xl font-black uppercase text-brand-black">{saved.bmi}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Calories</p>
                          <p className="font-display text-3xl font-black uppercase text-brand-black">{saved.calories}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Weight</p>
                          <p className="font-display text-3xl font-black uppercase text-brand-black">{saved.weightKg}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                  <p className="font-display text-3xl font-black uppercase text-brand-black">No reports yet</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Run the calculator and click Save Report to build your dashboard history.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div data-aos="fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <Sparkles size={14} />
              Educational Micro-Content
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              Quick insights that drive action
            </h2>

            <div className="mt-5 grid gap-3">
              {microTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <article key={tip.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                        <Icon size={18} />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-black uppercase leading-none text-brand-black">
                          {tip.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">{tip.text}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div data-aos="fade-up" data-aos-delay="80">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <ShieldCheck size={14} />
              Trust + Conversion Layer
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-brand-black">
              Signals that close purchases
            </h2>

            <div className="mt-5 grid gap-3">
              {trustSignals.map((signal) => (
                <div key={signal} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <p className="flex items-start gap-2 text-sm leading-6 text-neutral-600">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-brand-orange" />
                    {signal}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-200 bg-brand-black p-5 text-white sm:p-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
                <Zap size={14} />
                Final Conversion CTA
              </p>
              <h3 className="mt-3 font-display text-4xl font-black uppercase leading-none">
                Start your
                <span className="text-brand-orange"> personalized stack</span>
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Get precise supplement recommendations and move directly to checkout with confidence.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#smart-calculator" className="btn-primary h-11 px-6">
                  Get Your Plan
                </a>
                <Link
                  href="/products"
                  className="btn-secondary h-11 border-white/35 bg-white/10 px-6 text-white hover:border-white hover:bg-white hover:text-brand-black"
                >
                  Browse Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {callOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-neutral-900/50 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-5 shadow-lift sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-3xl font-black uppercase text-brand-black">Talk to Expert</h3>
              <button className="btn-icon" onClick={() => setCallOpen(false)} aria-label="Close">
                x
              </button>
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              Submit intent and we route your lead instantly to the right specialist queue.
            </p>

            <form className="mt-4 grid gap-3" onSubmit={routeLead}>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Name
                <input
                  className="field"
                  value={leadForm.name}
                  onChange={(event) =>
                    setLeadForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Phone
                <input
                  className="field"
                  value={leadForm.phone}
                  onChange={(event) =>
                    setLeadForm((prev) => ({ ...prev, phone: sanitizePhone(event.target.value) }))
                  }
                  inputMode="numeric"
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Goal
                <select
                  className="field"
                  value={leadForm.goal}
                  onChange={(event) =>
                    setLeadForm((prev) => ({ ...prev, goal: event.target.value as GoalKey }))
                  }
                >
                  {goalCards.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                Intent Before Call
                <textarea
                  className="min-h-24 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  value={leadForm.intent}
                  onChange={(event) =>
                    setLeadForm((prev) => ({ ...prev, intent: event.target.value }))
                  }
                  required
                />
              </label>

              {callError ? <p className="text-sm font-medium text-red-600">{callError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary h-10 px-5">
                  Route Lead
                </button>
                <a href="tel:+9118001209656" className="btn-secondary h-10 px-5">
                  Call Now
                </a>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
