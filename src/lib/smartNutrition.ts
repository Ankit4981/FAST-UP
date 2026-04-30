export type NutritionValues = {
  protein: number;
  calories: number;
  carbs: number;
  fats: number;
};

export type FoodProfile = NutritionValues & {
  label: string;
  aliases: string[];
  serving: string;
  unit: string;
  gramBased?: boolean;
};

export type NutritionInsight = {
  food: FoodProfile;
  amountLabel: string;
  totals: NutritionValues;
};

export const SMART_NUTRITION_DEFAULT_LOG = "I ate 2 chapatis";

export const SMART_NUTRITION_QUICK_LOGS = [
  "I ate 2 chapatis",
  "1 bowl dal",
  "3 eggs",
  "1 banana",
  "150g paneer"
];

export const SMART_NUTRITION_SUPPORTED_FOODS: FoodProfile[] = [
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

export function formatNutritionValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function parseSmartFoodLog(log: string): NutritionInsight | null {
  const normalized = normalizeText(log);
  if (!normalized) {
    return null;
  }

  const food = SMART_NUTRITION_SUPPORTED_FOODS.find((profile) =>
    profile.aliases.some((alias) => normalized.includes(alias))
  );

  if (!food) {
    return null;
  }

  const quantity = extractNumber(normalized);
  const gramsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g\b/);
  const gramAmount = gramsMatch ? Number(gramsMatch[1]) : null;

  const multiplier = food.gramBased && gramAmount ? gramAmount / 100 : quantity;
  const amountLabel =
    food.gramBased && gramAmount
      ? `${formatNutritionValue(gramAmount)}g`
      : `${formatNutritionValue(quantity)} ${food.unit}`;

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

export function composeProteinFeedback(insight: NutritionInsight | null) {
  if (!insight) {
    return 'Try a food log like "I ate 2 chapatis" or "1 bowl dal" to preview nutrition insights.';
  }

  return `You consumed approximately ${formatNutritionValue(insight.totals.protein)}g of protein from ${insight.amountLabel}.`;
}

