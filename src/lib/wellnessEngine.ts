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

  if (hasAnySignal(text, ["hello", "hey", "coach"])) {
    return "Hi, I can help with hydration, vegan muscle gain, calculator guidance, and product recommendations in a few seconds.";
  }

  if (hasAnySignal(text, ["bmi", "bmr", "calorie", "calculator", "health score"])) {
    return "Use Smart Health Calculator: enter age, gender, height, weight, activity and diet to get BMI, BMR, calories and exact supplement mapping in under 60 seconds.";
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

  if (hasAnySignal(text, ["vegan", "muscle"]) || hasAnySignal(text, ["plant", "muscle"])) {
    const plantProtein = findProductBySignals(params.products, ["plant"]) ?? params.products[0];
    const recovery = findProductBySignals(params.products, ["recovery"]) ?? params.products[1];

    return [
      `For vegan muscle gain, choose ${plantProtein.name} as your daily protein base.`,
      `Add ${recovery.name} after training to support recovery and consistency.`,
      "Target high protein intake across meals and train with progressive overload."
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

  if (hasAnySignal(text, ["call", "talk", "expert", "phone", "consult"])) {
    return "Tap Talk to Expert, share your goal and intent, and we route you instantly to the right specialist queue with a fast callback ETA.";
  }

  if (hasAnySignal(text, ["order", "delivery", "track", "shipping", "refund"])) {
    return buildOrderReply(params.orders ?? []);
  }

  const goal = detectGoalFromText(text) ?? params.fallbackGoal;
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
