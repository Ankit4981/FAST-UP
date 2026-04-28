import type { Order, Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export type GoalKey = "weight_loss" | "muscle_gain" | "energy_hydration" | "immunity";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type DietPreference = "vegan" | "vegetarian" | "non_vegetarian";
export type Gender = "male" | "female" | "other";
export type HealthClassification = "Underweight" | "Fit" | "Overweight";

export type HealthInputs = {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  activity: ActivityLevel;
  diet: DietPreference;
  goal: GoalKey;
  bodyFat?: number;
};

export type HealthReport = {
  bmi: number;
  bmr: number;
  dailyCalories: number;
  estimatedBodyFat: number;
  classification: HealthClassification;
  healthScore: number;
};

export type SupplementMatch = {
  product: Product;
  matchScore: number;
  bestFor: string;
  reasons: string[];
  cta: string;
};

export type SavedHealthSnapshot = {
  id: string;
  createdAt: string;
  goal: GoalKey;
  bmi: number;
  calories: number;
  healthScore: number;
  weightKg: number;
  recommendations: Array<{
    productId: string;
    name: string;
    matchScore: number;
  }>;
};

export type LeadRouting = {
  team: string;
  queue: string;
  eta: string;
  phone: string;
};

export const goalMeta: Record<GoalKey, { label: string; subtitle: string; signals: string[] }> = {
  weight_loss: {
    label: "Weight Loss",
    subtitle: "Lean performance without energy crashes",
    signals: ["weight loss", "lean", "fat", "metabolism", "hydration", "energy"]
  },
  muscle_gain: {
    label: "Muscle Gain",
    subtitle: "Strength, recovery and protein support",
    signals: ["muscle gain", "muscle", "strength", "protein", "recovery", "post-workout"]
  },
  energy_hydration: {
    label: "Energy & Hydration",
    subtitle: "Sustained stamina and electrolyte balance",
    signals: ["energy", "hydration", "endurance", "stamina", "electrolytes", "pre-workout"]
  },
  immunity: {
    label: "Immunity",
    subtitle: "Daily resilience with micronutrient support",
    signals: ["immunity", "daily wellness", "vitamin", "multivitamin", "vitamin c", "zinc"]
  }
};

export const activityMeta: Record<ActivityLevel, { label: string; multiplier: number }> = {
  sedentary: { label: "Sedentary", multiplier: 1.2 },
  light: { label: "Lightly Active", multiplier: 1.375 },
  moderate: { label: "Moderately Active", multiplier: 1.55 },
  active: { label: "Highly Active", multiplier: 1.725 },
  athlete: { label: "Athlete", multiplier: 1.9 }
};

const defaultInputsByGoal: Record<GoalKey, HealthInputs> = {
  weight_loss: {
    age: 29,
    heightCm: 168,
    weightKg: 78,
    gender: "female",
    activity: "light",
    diet: "vegetarian",
    goal: "weight_loss"
  },
  muscle_gain: {
    age: 26,
    heightCm: 176,
    weightKg: 70,
    gender: "male",
    activity: "active",
    diet: "non_vegetarian",
    goal: "muscle_gain"
  },
  energy_hydration: {
    age: 27,
    heightCm: 173,
    weightKg: 68,
    gender: "male",
    activity: "moderate",
    diet: "vegetarian",
    goal: "energy_hydration"
  },
  immunity: {
    age: 33,
    heightCm: 165,
    weightKg: 64,
    gender: "female",
    activity: "light",
    diet: "vegan",
    goal: "immunity"
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const unit = 10 ** digits;
  return Math.round(value * unit) / unit;
}

function hasAnySignal(text: string, signals: string[]) {
  return signals.some((signal) => text.includes(signal));
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getDietCompatibilityScore(product: Product, diet: DietPreference) {
  const tags = [...product.tags, ...product.goalTags, product.name].join(" ").toLowerCase();

  if (diet === "vegan") {
    return /vegan|plant/.test(tags) ? 16 : -24;
  }

  if (diet === "vegetarian") {
    return /vegan|plant|daily|immunity|whey|protein/.test(tags) ? 10 : 0;
  }

  return 4;
}

function getClassificationScore(product: Product, classification: HealthClassification) {
  const indexText = [...product.goalTags, ...product.tags].join(" ").toLowerCase();

  if (classification === "Underweight") {
    return /muscle|protein|recovery|strength/.test(indexText) ? 10 : 2;
  }

  if (classification === "Overweight") {
    return /weight|lean|hydration|energy|metabolism/.test(indexText) ? 10 : 1;
  }

  return /immunity|daily|hydration|recovery/.test(indexText) ? 8 : 3;
}

function getActivityScore(product: Product, activity: ActivityLevel) {
  const indexText = [...product.goalTags, ...product.tags].join(" ").toLowerCase();

  if (activity === "athlete" || activity === "active") {
    return /endurance|electrolytes|recovery|strength|pre-workout/.test(indexText) ? 10 : 4;
  }

  if (activity === "moderate") {
    return /daily|hydration|energy|recovery/.test(indexText) ? 8 : 3;
  }

  return /immunity|daily|wellness|vitamin/.test(indexText) ? 8 : 2;
}

function getGoalHitScore(product: Product, goal: GoalKey) {
  const indexText = [product.name, product.category, ...product.tags, ...product.goalTags]
    .join(" ")
    .toLowerCase();

  const hits = goalMeta[goal].signals.filter((signal) => indexText.includes(signal)).length;
  return hits * 15;
}

function resolveBestFor(product: Product, goal: GoalKey) {
  const primaryTag = product.goalTags[0] ?? product.tags[0] ?? product.category;
  return `Best for ${goalMeta[goal].label}: ${primaryTag}`;
}

function buildRecommendationReasons(
  product: Product,
  inputs: HealthInputs,
  report: HealthReport
): string[] {
  const topNutrition = product.nutrition.slice(0, 2).join(" + ");

  return [
    `Aligned to your ${goalMeta[inputs.goal].label.toLowerCase()} plan and ${activityMeta[inputs.activity].label.toLowerCase()} routine.`,
    `Supports a ${report.classification.toLowerCase()} profile with a daily target near ${Math.round(report.dailyCalories)} kcal.`,
    `Formula highlights: ${topNutrition}.`
  ];
}

export function getDefaultHealthInputs(goal: GoalKey = "energy_hydration"): HealthInputs {
  return { ...defaultInputsByGoal[goal] };
}

export function detectGoalFromText(message: string): GoalKey | undefined {
  const text = normalizeText(message);

  if (hasAnySignal(text, ["weight", "fat", "lean", "cut", "loss"])) {
    return "weight_loss";
  }

  if (hasAnySignal(text, ["muscle", "bulk", "strength", "protein", "mass"])) {
    return "muscle_gain";
  }

  if (hasAnySignal(text, ["energy", "hydration", "electrolyte", "stamina", "endurance", "reload"])) {
    return "energy_hydration";
  }

  if (hasAnySignal(text, ["immune", "immunity", "vitamin", "wellness", "daily", "zinc"])) {
    return "immunity";
  }

  return undefined;
}

export function calculateHealthReport(inputs: HealthInputs): HealthReport {
  const safeHeight = clamp(inputs.heightCm, 120, 220);
  const safeWeight = clamp(inputs.weightKg, 35, 220);
  const safeAge = clamp(inputs.age, 15, 85);

  const heightMeters = safeHeight / 100;
  const bmi = safeWeight / (heightMeters * heightMeters);

  const genderBias =
    inputs.gender === "male" ? 5 : inputs.gender === "female" ? -161 : -78;

  const bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + genderBias;
  const caloriesBase = bmr * activityMeta[inputs.activity].multiplier;

  const goalAdjustment =
    inputs.goal === "weight_loss" ? -350 : inputs.goal === "muscle_gain" ? 250 : 0;

  const dailyCalories = caloriesBase + goalAdjustment;

  const estimatedBodyFat =
    inputs.bodyFat ??
    1.2 * bmi + 0.23 * safeAge - (inputs.gender === "male" ? 10.8 : 0) - 5.4;

  const classification: HealthClassification =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Fit" : "Overweight";

  const bmiPenalty = Math.min(36, Math.abs(bmi - 22) * 4.5);
  const bodyFatPenalty = Math.max(0, (estimatedBodyFat - 24) * 0.75);
  const activityBoost =
    { sedentary: 6, light: 10, moderate: 14, active: 18, athlete: 20 }[inputs.activity];

  const healthScore = clamp(
    Math.round(82 - bmiPenalty - bodyFatPenalty + activityBoost),
    42,
    98
  );

  return {
    bmi: round(bmi, 1),
    bmr: Math.round(bmr),
    dailyCalories: Math.round(dailyCalories),
    estimatedBodyFat: round(clamp(estimatedBodyFat, 4, 55), 1),
    classification,
    healthScore
  };
}

export function getAchievementBadges(report: HealthReport): string[] {
  const badges: string[] = [];

  if (report.healthScore >= 85) {
    badges.push("Peak Consistency");
  }

  if (report.classification === "Fit") {
    badges.push("Balanced Profile");
  }

  if (report.estimatedBodyFat <= 22) {
    badges.push("Lean Momentum");
  }

  if (report.dailyCalories >= 2200 && report.classification !== "Overweight") {
    badges.push("Performance Fueler");
  }

  if (badges.length === 0) {
    badges.push("Starter Streak");
  }

  return badges.slice(0, 3);
}

export function recommendSupplements(
  products: Product[],
  inputs: HealthInputs,
  report: HealthReport,
  limit = 3
): SupplementMatch[] {
  return products
    .map((product) => {
      let score = 20;

      score += product.rating * 7;
      score += product.featured ? 4 : 0;
      score += getGoalHitScore(product, inputs.goal);
      score += getDietCompatibilityScore(product, inputs.diet);
      score += getActivityScore(product, inputs.activity);
      score += getClassificationScore(product, report.classification);

      const matchScore = clamp(Math.round(score), 42, 98);

      return {
        product,
        matchScore,
        bestFor: resolveBestFor(product, inputs.goal),
        reasons: buildRecommendationReasons(product, inputs, report),
        cta: `Add ${product.name} to your ${goalMeta[inputs.goal].label.toLowerCase()} stack`
      } satisfies SupplementMatch;
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function routeLeadByGoal(goal: GoalKey): LeadRouting {
  const map: Record<GoalKey, LeadRouting> = {
    weight_loss: {
      team: "Lean Transformation Coach",
      queue: "WL-Desk",
      eta: "Call back within 10 minutes",
      phone: "+91-1800-120-9656"
    },
    muscle_gain: {
      team: "Sports Nutrition Specialist",
      queue: "MG-Desk",
      eta: "Call back within 8 minutes",
      phone: "+91-1800-120-9656"
    },
    energy_hydration: {
      team: "Hydration Performance Expert",
      queue: "EH-Desk",
      eta: "Call back within 6 minutes",
      phone: "+91-1800-120-9656"
    },
    immunity: {
      team: "Daily Wellness Advisor",
      queue: "IM-Desk",
      eta: "Call back within 12 minutes",
      phone: "+91-1800-120-9656"
    }
  };

  return map[goal];
}

export function createProgressInsight(history: SavedHealthSnapshot[]) {
  if (history.length < 2) {
    return {
      scoreDelta: 0,
      weightDelta: 0,
      trend: "Create at least two reports to unlock trend insights."
    };
  }

  const latest = history[0];
  const baseline = history[Math.min(history.length - 1, 3)];
  const scoreDelta = latest.healthScore - baseline.healthScore;
  const weightDelta = round(latest.weightKg - baseline.weightKg, 1);

  let trend = "Your metrics are stable. Keep consistency for stronger gains.";

  if (scoreDelta >= 4) {
    trend = "Great momentum. Your health score is improving week over week.";
  } else if (scoreDelta <= -4) {
    trend = "Your score has dipped. Adjust hydration, sleep and supplement timing.";
  }

  return { scoreDelta, weightDelta, trend };
}

function buildOrderReply(orders: Order[]) {
  if (!orders.length) {
    return "I can help track orders. Sign in first, then ask \"track my order\" for a live status update.";
  }

  const latest = orders[0];
  const eta = new Date(latest.estimatedDelivery).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });

  return `Latest order ${latest.orderNumber} is currently ${latest.status.replaceAll("_", " ")}. ETA: ${eta}.`;
}

function buildGoalReply(goal: GoalKey, products: Product[]) {
  const quickInputs = getDefaultHealthInputs(goal);
  const quickReport = calculateHealthReport(quickInputs);
  const matches = recommendSupplements(products, quickInputs, quickReport, 3);

  if (!matches.length) {
    return "I could not map products right now. Try the Smart Health Calculator for a precise plan.";
  }

  const top = matches[0];
  const compare = matches
    .slice(0, 3)
    .map((item) => `${item.product.name} (${item.matchScore}%)`)
    .join(", ");

  return [
    `Top picks for ${goalMeta[goal].label}: ${compare}.`,
    `Best match: ${top.product.name} at ${formatPrice(top.product.price)}.`,
    `${top.reasons[0]}`,
    "Use Get Your Plan to personalize this in under 60 seconds."
  ].join("\n");
}

function buildProductReply(query: string, products: Product[]) {
  const matched = products.find((product) => {
    const text = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.goalTags.join(" ")}`.toLowerCase();
    return query.split(" ").some((token) => token.length > 2 && text.includes(token));
  });

  if (!matched) {
    return undefined;
  }

  return [
    `${matched.name} is priced at ${formatPrice(matched.price)} and works best for ${matched.goalTags.slice(0, 2).join(" + ")}.`,
    `Why choose it: ${matched.description}`,
    `How to use: ${matched.howToUse}`
  ].join("\n");
}

function findProductBySignals(products: Product[], signals: string[]) {
  return products.find((product) => {
    const text = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.goalTags.join(" ")}`.toLowerCase();
    return signals.every((signal) => text.includes(signal));
  });
}

function findProductByAnySignals(products: Product[], signals: string[]) {
  return products.find((product) => {
    const text = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.goalTags.join(" ")}`.toLowerCase();
    return signals.some((signal) => text.includes(signal));
  });
}

function hasAllSignals(text: string, signals: string[]) {
  return signals.every((signal) => text.includes(signal));
}

function hasToken(text: string, words: string[]) {
  const tokens = new Set(text.split(" ").filter(Boolean));
  return words.some((word) => tokens.has(word));
}

function extractWeightFromText(text: string): number | undefined {
  const withKg = text.match(/\b(\d{2,3})\s?(kg|kgs|kilogram|kilograms)\b/);
  if (withKg) {
    const value = Number(withKg[1]);
    if (value >= 35 && value <= 220) {
      return value;
    }
  }

  const withWeightKeyword = text.match(/\bweight\s*(?:is|=|:)?\s*(\d{2,3})\b/);
  if (withWeightKeyword) {
    const value = Number(withWeightKeyword[1]);
    if (value >= 35 && value <= 220) {
      return value;
    }
  }

  return undefined;
}

function getProteinRangeByGoal(goal: GoalKey) {
  switch (goal) {
    case "weight_loss":
      return { min: 1.8, max: 2.2 };
    case "muscle_gain":
      return { min: 1.8, max: 2.4 };
    case "energy_hydration":
      return { min: 1.4, max: 1.8 };
    case "immunity":
      return { min: 1.2, max: 1.6 };
    default:
      return { min: 1.6, max: 2 };
  }
}

function buildProteinIntakeReply(text: string, products: Product[], goal: GoalKey) {
  const proteinProduct =
    findProductByAnySignals(products, ["whey", "protein", "plant protein"]) ?? products[0];
  const weight = extractWeightFromText(text);
  const proteinRange = getProteinRangeByGoal(goal);

  if (!weight) {
    return [
      `For ${goalMeta[goal].label.toLowerCase()}, target about ${proteinRange.min.toFixed(1)}-${proteinRange.max.toFixed(1)} g protein per kg bodyweight daily.`,
      `Use ${proteinProduct.name} to close your daily protein gap consistently.`,
      "Share your weight in kg and I can give your exact protein range."
    ].join("\n");
  }

  const min = Math.round(weight * proteinRange.min);
  const max = Math.round(weight * proteinRange.max);

  return [
    `At ${weight} kg, your protein target is about ${min}-${max} g/day for ${goalMeta[goal].label.toLowerCase()}.`,
    `A practical option is ${proteinProduct.name} (${formatPrice(proteinProduct.price)}).`,
    "Split protein across 3-5 meals and include a post-workout serving."
  ].join("\n");
}

function buildTopPicksReply(products: Product[], goal: GoalKey) {
  return buildGoalReply(goal, products);
}

function buildWheyVsPlantReply(products: Product[]) {
  const whey = findProductBySignals(products, ["whey"]) ?? findProductByAnySignals(products, ["protein"]) ?? products[0];
  const plant = findProductBySignals(products, ["plant"]) ?? findProductByAnySignals(products, ["vegan"]) ?? products[1] ?? whey;

  return [
    `Whey (like ${whey.name}) usually has faster absorption and is great post-workout.`,
    `Plant options (like ${plant.name}) are ideal for vegan or dairy-sensitive users.`,
    "Pick based on digestion preference and diet style, not hype."
  ].join("\n");
}

function buildBeginnerStackReply(products: Product[]) {
  const hydration = findProductByAnySignals(products, ["reload", "hydration", "electrolyte"]) ?? products[0];
  const protein = findProductByAnySignals(products, ["protein", "whey", "plant"]) ?? products[1] ?? products[0];
  const daily = findProductByAnySignals(products, ["multivitamin", "vitamin", "daily", "immunity"]) ?? products[2] ?? products[0];

  return [
    `Starter stack: ${hydration.name} + ${protein.name} + ${daily.name}.`,
    "Use hydration around training, protein after workouts, and daily support with breakfast.",
    "Keep this routine for 6-8 weeks before making changes."
  ].join("\n");
}

function buildComparisonReply(text: string, products: Product[], goal: GoalKey) {
  const relevant = products.filter((product) => {
    const indexText = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.goalTags.join(" ")}`.toLowerCase();
    return text.split(" ").some((token) => token.length > 2 && indexText.includes(token));
  });

  const pool = relevant.length >= 2 ? relevant.slice(0, 2) : recommendSupplements(products, getDefaultHealthInputs(goal), calculateHealthReport(getDefaultHealthInputs(goal)), 2).map((item) => item.product);
  const first = pool[0];
  const second = pool[1] ?? pool[0];

  if (!first || !second) {
    return "Tell me which two products you want to compare, and I will break down use case, timing and budget.";
  }

  return [
    `${first.name}: better for ${first.goalTags.slice(0, 2).join(" + ")}.`,
    `${second.name}: better for ${second.goalTags.slice(0, 2).join(" + ")}.`,
    "Choose based on your current goal, then lock usage consistency for at least 4 weeks."
  ].join("\n");
}

function extractWeightFromLbText(text: string): number | undefined {
  const withLb = text.match(/\b(\d{2,3})\s?(lb|lbs|pound|pounds)\b/);
  if (!withLb) {
    return undefined;
  }

  const lbValue = Number(withLb[1]);
  if (lbValue < 80 || lbValue > 500) {
    return undefined;
  }

  return Math.round(lbValue * 0.453592);
}

function buildHydrationTargetReply(text: string, products: Product[]) {
  const hydrationProduct =
    findProductByAnySignals(products, ["reload", "electrolyte", "hydration"]) ?? products[0];

  if (!hydrationProduct) {
    return "Stay hydrated through the day and during workouts. Use the calculator for personalized hydration and nutrition guidance.";
  }

  const weightKg = extractWeightFromText(text) ?? extractWeightFromLbText(text);

  if (!weightKg) {
    return [
      "A practical hydration target is usually around 30-40 ml per kg bodyweight daily, then extra based on sweat loss.",
      `Use ${hydrationProduct.name} around hard workouts or long runs for electrolyte support.`,
      "Share your weight and workout duration for a more exact hydration target."
    ].join("\n");
  }

  const dailyMin = Math.round(weightKg * 30);
  const dailyMax = Math.round(weightKg * 40);

  return [
    `At about ${weightKg} kg, target roughly ${dailyMin}-${dailyMax} ml water daily before adding workout sweat losses.`,
    `For intense sessions, include ${hydrationProduct.name} to replenish electrolytes.`,
    "Check urine color (pale yellow is ideal) and adjust fluids based on heat and training time."
  ].join("\n");
}

function buildBudgetStackReply(products: Product[], goal: GoalKey) {
  const fallbackPicks = recommendSupplements(
    products,
    getDefaultHealthInputs(goal),
    calculateHealthReport(getDefaultHealthInputs(goal)),
    5
  ).map((item) => item.product);

  const budgetPicks = [...fallbackPicks]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  if (!budgetPicks.length) {
    return "I can build a budget stack once products are available. Try the Smart Calculator for a goal-first plan.";
  }

  const list = budgetPicks.map((item) => `${item.name} (${formatPrice(item.price)})`).join(", ");
  return [
    `Budget-friendly picks for ${goalMeta[goal].label.toLowerCase()}: ${list}.`,
    "Start with 1-2 core products first, stay consistent for 4 weeks, then scale if needed.",
    "I can also rank these by your exact goal, diet and activity level."
  ].join("\n");
}

function buildWeightGainReply(products: Product[]) {
  const protein = findProductByAnySignals(products, ["whey", "protein", "plant"]) ?? products[0];
  const pre = findProductByAnySignals(products, ["activate", "pre-workout", "energy"]) ?? products[1] ?? protein;
  const recovery = findProductByAnySignals(products, ["recover", "recovery", "bcaa"]) ?? products[2] ?? protein;

  if (!protein) {
    return "For healthy weight gain, use a mild calorie surplus, progressive strength training, and high-protein meals.";
  }

  return [
    "For clean weight gain, keep a mild calorie surplus and train with progressive overload.",
    `Base stack: ${protein.name} + ${pre.name} + ${recovery.name}.`,
    "Aim for steady weekly gain instead of fast fat gain."
  ].join("\n");
}

function buildPlateauReply(products: Product[], goal: GoalKey) {
  const picks = recommendSupplements(
    products,
    getDefaultHealthInputs(goal),
    calculateHealthReport(getDefaultHealthInputs(goal)),
    2
  );

  const best = picks[0]?.product;
  if (!best) {
    return "If progress has stalled, review sleep, training load, protein consistency and hydration first.";
  }

  return [
    "Plateaus are usually solved by tightening sleep, protein intake, workout progression and hydration consistency.",
    `Use ${best.name} consistently while tracking weekly body and performance trends.`,
    "If no change after 3-4 weeks, adjust calories or training volume."
  ].join("\n");
}

function buildFastingReply(products: Product[]) {
  const hydration = findProductByAnySignals(products, ["reload", "electrolyte", "hydration"]) ?? products[0];
  const protein = findProductByAnySignals(products, ["protein", "whey", "plant"]) ?? products[1] ?? hydration;

  if (!hydration) {
    return "During fasting routines, focus on hydration, training quality and total daily protein in your eating window.";
  }

  return [
    "During intermittent fasting, prioritize hydration in fasting hours and protein in eating windows.",
    `Use ${hydration.name} for electrolyte support and ${protein.name} to hit daily protein goals.`,
    "Train near your first major meal when possible for better recovery."
  ].join("\n");
}

function buildWomenSpecificReply(products: Product[]) {
  const women = findProductByAnySignals(products, ["women", "collagen", "daily wellness"]) ?? products[0];
  const immunity = findProductByAnySignals(products, ["vitamin c", "immunity", "zinc"]) ?? products[1] ?? women;

  if (!women) {
    return "For women's fitness nutrition, build around protein, micronutrients, hydration and recovery consistency.";
  }

  return [
    `A practical women's wellness stack can start with ${women.name} and ${immunity.name}.`,
    "Keep protein intake consistent and match training intensity to recovery.",
    "Use the Smart Calculator for exact calories and protein guidance."
  ].join("\n");
}

export function generateSmartAssistantReply(params: {
  message: string;
  products: Product[];
  orders?: Order[];
  fallbackGoal?: GoalKey;
}) {
  const text = normalizeText(params.message);

  if (!text) {
    return "Tell me your goal, age, activity level and diet, and I will suggest the best 2-3 supplements.";
  }

  const goal = detectGoalFromText(text) ?? params.fallbackGoal ?? "energy_hydration";

  if (
    hasAnySignal(text, ["good morning", "good evening", "good afternoon"]) ||
    (hasToken(text, ["hi", "hello", "hey", "yo"]) && text.split(" ").length <= 7)
  ) {
    return [
      "Hi, welcome to Fast&Up Coach.",
      "I can help with protein targets, workout supplements, hydration, weight loss, muscle gain and daily wellness.",
      "Tell me your goal and weight in kg for a more exact plan."
    ].join("\n");
  }

  if (hasToken(text, ["thanks", "thank", "thx"])) {
    return "You are welcome. If you share your goal and weight, I can refine your supplement plan further.";
  }

  if (hasAnySignal(text, ["how are you", "how r u", "how are u"])) {
    return "I am doing great and ready to help. Tell me your fitness goal and I will guide your supplements, calories and protein plan.";
  }

  if (hasAnySignal(text, ["bye", "good night", "see you"])) {
    return "Glad to help. Stay consistent with training, hydration and protein, and come back anytime for plan updates.";
  }

  if (hasAnySignal(text, ["who are you", "what can you do", "help me"])) {
    return [
      "I am your rule-based Fast&Up Coach.",
      "I can answer supplement, gym and nutrition questions, suggest products, and guide you to calculator and advisor.",
      "Try asking: protein target, hydration for running, vegan muscle gain, or best beginner stack."
    ].join("\n");
  }

  if (hasAnySignal(text, ["bmi", "bmr", "calorie", "calculator", "health score"])) {
    return "Use Smart Health Calculator: enter age, gender, height, weight, activity and diet to get BMI, BMR, calories and exact supplement mapping in under 60 seconds.";
  }

  if (
    hasAnySignal(text, ["what should i buy", "which supplement should i buy", "recommend supplement", "best supplement for me"]) ||
    (hasAnySignal(text, ["recommend", "suggest"]) && hasAnySignal(text, ["supplement", "product", "stack"]))
  ) {
    return buildGoalReply(goal, params.products);
  }

  if (
    hasAnySignal(text, ["protein intake", "protein target", "protein per day", "how much protein"]) ||
    (hasToken(text, ["protein"]) && hasAnySignal(text, ["how much", "per day", "daily"]))
  ) {
    return buildProteinIntakeReply(text, params.products, goal);
  }

  if (hasAnySignal(text, ["best time protein", "when to take protein", "protein timing"])) {
    const protein = findProductByAnySignals(params.products, ["whey", "protein", "plant"]) ?? params.products[0];
    if (!protein) {
      return "Protein timing is simple: spread protein through the day and include one serving after workouts.";
    }
    return [
      `Use ${protein.name} after workouts or between meals to meet your daily target.`,
      "You can split protein across 3-5 meals for better consistency and recovery.",
      "Daily total protein matters more than perfect timing."
    ].join("\n");
  }

  if (hasAnySignal(text, ["how many calories", "calorie target", "daily calories", "maintenance calories"])) {
    return [
      "Calorie needs depend on age, weight, height, activity and goal.",
      "Use the Smart Calculator for exact BMR and daily calories in under 60 seconds.",
      "For fat loss use a mild deficit, and for muscle gain use a moderate surplus."
    ].join("\n");
  }

  if (hasAnySignal(text, ["macro", "carbs", "fats", "carb fat protein split"])) {
    return [
      "A practical split is protein first, fats moderate, and carbs adjusted to your training load.",
      "Use Smart Calculator to get personalized protein, carbs and fats from your goal and body stats.",
      "Consistency matters more than perfect percentages."
    ].join("\n");
  }

  if (hasAnySignal(text, ["water intake", "how much water", "hydration target", "litre", "liters", "litres"])) {
    return buildHydrationTargetReply(text, params.products);
  }

  if (hasAllSignals(text, ["whey", "plant"]) || hasAnySignal(text, ["whey vs plant", "whey or plant"])) {
    return buildWheyVsPlantReply(params.products);
  }

  if (hasAnySignal(text, ["lactose", "dairy issue", "dairy allergy", "cannot digest whey", "whey causes acne"])) {
    const plant = findProductByAnySignals(params.products, ["plant", "vegan", "protein"]) ?? params.products[0];
    if (!plant) {
      return "If dairy causes issues, prefer plant-based protein and monitor digestion over 1-2 weeks.";
    }
    return [
      "If dairy upsets your stomach, start with plant-based protein options.",
      `A good fit can be ${plant.name}.`,
      "Start with half serving for 3-4 days and increase as digestion feels comfortable."
    ].join("\n");
  }

  if (hasAnySignal(text, ["hydration", "running"]) || hasAnySignal(text, ["run", "electrolyte"])) {
    const reload = findProductBySignals(params.products, ["reload"]) ?? params.products[0];
    const bundle = findProductBySignals(params.products, ["endurance"]) ?? params.products[1];

    return [
      `For running hydration, start with ${reload.name} at ${formatPrice(reload.price)}.`,
      `If you need a full race-day stack, add ${bundle.name} for hydration plus recovery support.`,
      "Use one serving before or during long runs and keep water intake steady."
    ].join("\n");
  }

  if (hasAnySignal(text, ["pre workout", "pre-workout", "before workout", "before gym"])) {
    const pre = findProductByAnySignals(params.products, ["pre-workout", "activate", "energy"]) ?? params.products[0];
    return [
      `Take ${pre.name} about 20-30 minutes before training.`,
      "Avoid late-night use if caffeine affects your sleep.",
      "Hydrate well before and during your session."
    ].join("\n");
  }

  if (hasAnySignal(text, ["post workout", "after workout", "soreness", "recovery", "muscle pain"])) {
    const recovery = findProductByAnySignals(params.products, ["recovery", "bcaa", "protein"]) ?? params.products[0];
    return [
      `For recovery, use ${recovery.name} soon after training.`,
      "Pair it with adequate sleep and total daily protein intake.",
      "If soreness stays high for days, reduce load and improve hydration."
    ].join("\n");
  }

  if (hasAnySignal(text, ["weight gain", "gain weight", "hard gainer", "hardgainer"])) {
    return buildWeightGainReply(params.products);
  }

  if (hasAnySignal(text, ["vegan", "muscle"]) || hasAnySignal(text, ["plant", "muscle"])) {
    const plantProtein = findProductBySignals(params.products, ["plant"]) ?? params.products[0];
    const recovery = findProductBySignals(params.products, ["recovery"]) ?? params.products[1];

    return [
      `For vegan muscle gain, choose ${plantProtein.name} as your daily protein base.`,
      `Add ${recovery.name} after training to support recovery and consistency.`,
      "Target high protein intake across meals and train with progressive overload."
    ].join("\n");
  }

  if (hasAnySignal(text, ["weight loss supplement", "fat loss supplement", "lose fat"])) {
    return buildTopPicksReply(params.products, "weight_loss");
  }

  if (hasAnySignal(text, ["muscle gain supplement", "gain muscle", "bulk up"])) {
    return buildTopPicksReply(params.products, "muscle_gain");
  }

  if (hasAnySignal(text, ["immunity", "daily wellness", "vitamin c", "zinc"])) {
    return buildTopPicksReply(params.products, "immunity");
  }

  if (hasAnySignal(text, ["beginner", "new to gym", "starting gym", "starter"])) {
    return buildBeginnerStackReply(params.products);
  }

  if (hasAnySignal(text, ["budget", "cheap", "affordable", "low price", "value for money"])) {
    return buildBudgetStackReply(params.products, goal);
  }

  if (hasAnySignal(text, ["plateau", "not seeing results", "stuck", "not working", "no progress"])) {
    return buildPlateauReply(params.products, goal);
  }

  if (hasAnySignal(text, ["intermittent fasting", "fasting diet", "fasted workout"])) {
    return buildFastingReply(params.products);
  }

  if (hasAnySignal(text, ["women supplement", "female supplement", "pcos", "skin hair"])) {
    return buildWomenSpecificReply(params.products);
  }

  if (hasAnySignal(text, ["side effect", "safe", "is it safe", "can i take daily"])) {
    return [
      "Use supplements as directed on label, stay hydrated, and avoid exceeding servings.",
      "If you have a medical condition, pregnancy, or current medication, check with a clinician first.",
      "Start one product at a time so your body response is clear."
    ].join("\n");
  }

  if (hasAnySignal(text, ["pregnant", "pregnancy", "breastfeeding", "lactating"])) {
    return [
      "During pregnancy or breastfeeding, do not self-start supplements without clinician approval.",
      "Share product labels with your doctor to confirm suitability and dosage.",
      "I can still help with general hydration and nutrition consistency guidance."
    ].join("\n");
  }

  if (hasAnySignal(text, ["diabetes", "thyroid", "bp", "blood pressure", "medication"])) {
    return [
      "If you have a medical condition or regular medication, confirm supplement choice with your clinician first.",
      "Start with low-risk basics like hydration and general wellness support as advised.",
      "Use one product at a time and monitor your response."
    ].join("\n");
  }

  if (hasAnySignal(text, ["teen", "15 year", "16 year", "17 year", "child", "kid"])) {
    return [
      "For teens, supplement use should be conservative and supervised by a parent and clinician.",
      "Prioritize sleep, whole-food meals, hydration and training technique first.",
      "If needed, choose age-appropriate products and follow label instructions strictly."
    ].join("\n");
  }

  if (hasAnySignal(text, ["how long", "when will i see results", "results time"])) {
    return [
      "Most users notice energy and hydration effects quickly, while body composition changes usually need 4-8 weeks.",
      "Supplements work best with consistent training, nutrition and sleep.",
      "Track weekly progress and adjust based on recovery and performance."
    ].join("\n");
  }

  if (hasAnySignal(text, ["rest day", "off day"])) {
    return [
      "On rest days, keep protein and hydration consistent to support recovery.",
      "You may skip stimulant pre-workouts unless needed for activity.",
      "Daily wellness supplements can continue as usual."
    ].join("\n");
  }

  if (hasAnySignal(text, ["creatine"])) {
    return [
      "Creatine is commonly used for strength and performance, typically with daily consistency.",
      "If you want, I can suggest an alternative stack from the current Fast&Up catalog while you compare options.",
      "Tell me your goal and I will map the closest in-catalog plan."
    ].join("\n");
  }

  if (hasAnySignal(text, ["tablet", "how to use", "fizz", "effervescent"])) {
    const reload = findProductBySignals(params.products, ["reload"]) ?? params.products[0];
    return [
      "Drop one effervescent tablet in about 250 ml water, wait until fully dissolved, then drink.",
      `For example, ${reload.name} works best before or during intense activity.`,
      "Do not swallow the tablet directly."
    ].join("\n");
  }

  if (hasAnySignal(text, ["compare", "vs", "difference", "better than"])) {
    return buildComparisonReply(text, params.products, goal);
  }

  if (hasAnySignal(text, ["call", "talk", "expert", "phone", "consult"])) {
    return "Tap Talk to Expert, share your goal and intent, and we route you instantly to the right specialist queue with a fast callback ETA.";
  }

  if (hasAnySignal(text, ["order", "delivery", "track", "shipping", "refund"])) {
    return buildOrderReply(params.orders ?? []);
  }

  if (goal) {
    return buildGoalReply(goal, params.products);
  }

  const productReply = buildProductReply(text, params.products);
  if (productReply) {
    return productReply;
  }

  return [
    "I can help with 3 things fast:",
    "1) Smart health plan (BMI, calories, score)",
    "2) Goal-based supplement recommendations",
    "3) Expert call routing for personal guidance"
  ].join("\n");
}

export function toVoiceSentence(text: string) {
  const collapsed = text.replace(/\s+/g, " ").trim();
  const firstSentence = collapsed.split(/(?<=[.!?])\s/)[0] ?? collapsed;
  if (!firstSentence) {
    return "I can help you with supplement guidance based on your goal.";
  }

  return /[.!?]$/.test(firstSentence) ? firstSentence : `${firstSentence}.`;
}
