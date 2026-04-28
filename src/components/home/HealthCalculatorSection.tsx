"use client";

import { Activity, Calculator, Flame, HeartPulse, Scale, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  activityMeta,
  calculateHealthReport,
  recommendSupplements,
  type ActivityLevel,
  type DietPreference,
  type Gender,
  type GoalKey,
  type HealthInputs
} from "@/lib/wellnessEngine";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type HealthCalculatorSectionProps = {
  products: Product[];
};

type FormState = {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  diet: DietPreference;
  goal: GoalKey;
  bodyFat?: number;
};

type NutritionTargets = {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterMl: number;
};

const activityOptions: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "athlete"];

const dietOptions: Array<{ value: DietPreference; label: string }> = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-Vegetarian" }
];

const goalOptions: Array<{ value: GoalKey; label: string }> = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "energy_hydration", label: "Energy & Hydration" },
  { value: "immunity", label: "Immunity & Wellness" }
];

const defaultForm: FormState = {
  age: 27,
  gender: "male",
  heightCm: 172,
  weightKg: 70,
  activity: "moderate",
  diet: "vegetarian",
  goal: "muscle_gain"
};

function deriveNutritionTargets(form: FormState, targetCalories: number): NutritionTargets {
  const proteinPerKg =
    form.goal === "weight_loss"
      ? 2
      : form.goal === "muscle_gain"
      ? 2.2
      : form.goal === "energy_hydration"
      ? 1.8
      : 1.6;

  const fatPerKg = form.goal === "muscle_gain" ? 1 : form.goal === "weight_loss" ? 0.8 : 0.9;

  const proteinG = Math.round(form.weightKg * proteinPerKg);
  const fatsG = Math.round(form.weightKg * fatPerKg);
  const proteinCalories = proteinG * 4;
  const fatCalories = fatsG * 9;
  const carbsG = Math.max(0, Math.round((targetCalories - proteinCalories - fatCalories) / 4));
  const waterMl = Math.round(form.weightKg * 35);

  return { proteinG, carbsG, fatsG, waterMl };
}

export function HealthCalculatorSection({ products }: HealthCalculatorSectionProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submittedForm, setSubmittedForm] = useState<FormState>(defaultForm);

  const inputs: HealthInputs = useMemo(
    () => ({
      ...submittedForm,
      bodyFat: submittedForm.bodyFat
    }),
    [submittedForm]
  );

  const report = useMemo(() => calculateHealthReport(inputs), [inputs]);
  const nutritionTargets = useMemo(
    () => deriveNutritionTargets(submittedForm, report.dailyCalories),
    [report.dailyCalories, submittedForm]
  );

  const suggestions = useMemo(
    () => recommendSupplements(products, inputs, report, 2),
    [inputs, products, report]
  );

  const classificationTone =
    report.classification === "Fit"
      ? "bg-green-100 text-green-700 border-green-300"
      : report.classification === "Underweight"
      ? "bg-sky-100 text-sky-700 border-sky-300"
      : "bg-amber-100 text-amber-700 border-amber-300";

  function handleCalculate() {
    setSubmittedForm({ ...form });
  }

  return (
    <section id="smart-calculator" className="section-shell bg-brand-grey" aria-labelledby="health-calc-heading">
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="surface-card p-5 sm:p-6">
          <p className="eyebrow">Smart calculator</p>
          <h2 id="health-calc-heading" className="section-heading mt-4 text-left">
            Health <span>Calculator</span>
          </h2>
          <p className="section-kicker text-left">
            Calculate BMI, BMR, daily calories, protein target and macro guidance in one place.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="compact-label">
              Age
              <input
                type="number"
                min={15}
                max={85}
                value={form.age}
                onChange={(event) =>
                  setForm((current) => ({ ...current, age: Number(event.target.value) || current.age }))
                }
                className="field mt-1"
              />
            </label>

            <label className="compact-label">
              Gender
              <select
                value={form.gender}
                onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))}
                className="field mt-1"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </label>

            <label className="compact-label">
              Height (cm)
              <input
                type="number"
                min={120}
                max={220}
                value={form.heightCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    heightCm: Number(event.target.value) || current.heightCm
                  }))
                }
                className="field mt-1"
              />
            </label>

            <label className="compact-label">
              Weight (kg)
              <input
                type="number"
                min={35}
                max={220}
                value={form.weightKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    weightKg: Number(event.target.value) || current.weightKg
                  }))
                }
                className="field mt-1"
              />
            </label>

            <label className="compact-label">
              Activity level
              <select
                value={form.activity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, activity: event.target.value as ActivityLevel }))
                }
                className="field mt-1"
              >
                {activityOptions.map((activity) => (
                  <option key={activity} value={activity}>
                    {activityMeta[activity].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="compact-label">
              Goal
              <select
                value={form.goal}
                onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as GoalKey }))}
                className="field mt-1"
              >
                {goalOptions.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="compact-label">
              Diet
              <select
                value={form.diet}
                onChange={(event) =>
                  setForm((current) => ({ ...current, diet: event.target.value as DietPreference }))
                }
                className="field mt-1"
              >
                {dietOptions.map((diet) => (
                  <option key={diet.value} value={diet.value}>
                    {diet.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="compact-label">
              Optional body fat %
              <input
                type="number"
                min={4}
                max={55}
                value={form.bodyFat ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bodyFat: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
                className="field mt-1"
                placeholder="Auto-estimated if blank"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={handleCalculate} className="btn-primary">
              <Calculator size={17} />
              Calculate Now
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                setSubmittedForm(defaultForm);
              }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-3xl font-black uppercase text-brand-black">Your results</h3>
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${classificationTone}`}>
              {report.classification}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="compact-label">BMI</p>
              <p className="mt-1 font-display text-4xl font-black text-brand-black">{report.bmi.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="compact-label">BMR</p>
              <p className="mt-1 font-display text-4xl font-black text-brand-black">{report.bmr}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="compact-label">Daily calories</p>
              <p className="mt-1 font-display text-4xl font-black text-brand-black">{report.dailyCalories}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="compact-label">Protein target</p>
              <p className="mt-1 font-display text-4xl font-black text-brand-black">{nutritionTargets.proteinG}g</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="compact-label">Carbs</p>
              <p className="mt-1 text-xl font-black text-brand-black">{nutritionTargets.carbsG}g</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="compact-label">Fats</p>
              <p className="mt-1 text-xl font-black text-brand-black">{nutritionTargets.fatsG}g</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="compact-label">Water</p>
              <p className="mt-1 text-xl font-black text-brand-black">{nutritionTargets.waterMl} ml</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-brand-grey p-4">
            <p className="compact-label">Other health indicators</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <p className="flex items-center gap-2 text-sm text-neutral-700">
                <HeartPulse size={15} className="text-brand-orange" />
                Body fat: {report.estimatedBodyFat.toFixed(1)}%
              </p>
              <p className="flex items-center gap-2 text-sm text-neutral-700">
                <Scale size={15} className="text-brand-orange" />
                BMI class: {report.classification}
              </p>
              <p className="flex items-center gap-2 text-sm text-neutral-700">
                <Zap size={15} className="text-brand-orange" />
                Health score: {report.healthScore}/100
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-4">
            <p className="compact-label">Suggested supplements for your profile</p>
            <div className="mt-3 grid gap-3">
              {suggestions.map((item) => (
                <div key={item.product.id} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-brand-black">{item.product.name}</p>
                    <span className="rounded-full bg-brand-orange/10 px-2 py-1 text-[11px] font-bold text-brand-orange">
                      {item.matchScore}% match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{item.bestFor}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-brand-black">{formatPrice(item.product.price)}</p>
                    <Link href={`/products/${item.product.slug}`} className="btn-secondary h-8 px-3 text-xs">
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            Estimates are for guidance and do not replace medical advice.
          </p>
        </div>
      </div>

      <div className="container-page mt-6">
        <div className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-3">
          <p className="flex items-center gap-2 text-sm text-neutral-700">
            <Target size={15} className="text-brand-orange" />
            Goal-aware calorie target for faster decision making
          </p>
          <p className="flex items-center gap-2 text-sm text-neutral-700">
            <Activity size={15} className="text-brand-orange" />
            Activity-adjusted macros (protein, carbs, fats)
          </p>
          <p className="flex items-center gap-2 text-sm text-neutral-700">
            <Flame size={15} className="text-brand-orange" />
            Direct product mapping to reduce guesswork
          </p>
        </div>
      </div>
    </section>
  );
}
