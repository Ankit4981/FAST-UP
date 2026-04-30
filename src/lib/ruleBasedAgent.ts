export type AgentMatchMode = "matched" | "clarify" | "fallback";

export type RuleAgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RuleAgentResult = {
  mode: AgentMatchMode;
  message: string;
  quickReplies: string[];
  matchedIntentId?: string;
};

type CoreIntent =
  | "GREETING"
  | "PRODUCT_RECOMMENDATION"
  | "PRODUCT_BENEFITS"
  | "USAGE_INSTRUCTIONS"
  | "SAFETY_HEALTH"
  | "PURCHASE_AVAILABILITY"
  | "ORDER_TRACKING"
  | "OFFERS_DISCOUNTS"
  | "THANKS";

type RecommendationGoal = "energy" | "hydration" | "muscle" | null;
type UsageContext = "daily" | "workout" | "running" | null;
type ProductKey = "vitamin_c" | "multivitamin" | "reload" | "whey_protein" | null;

type ExtractedEntities = {
  goal: RecommendationGoal;
  context: UsageContext;
  product: ProductKey;
  orderId: string | null;
  hasMedicalSignal: boolean;
};

type PendingState = "recommendation_goal" | "recommendation_context" | "order_id" | null;

type IntentDefinition = {
  id: CoreIntent;
  keywords: string[];
  quickReplies: string[];
};

const DEFAULT_QUICK_REPLIES = [
  "Recommend product",
  "Product benefits",
  "How to use",
  "Track order",
  "Offers",
];

const INTENT_DICTIONARY: IntentDefinition[] = [
  {
    id: "GREETING",
    keywords: ["hi", "hello", "hey", "namaste", "start"],
    quickReplies: ["Recommend product", "Track order", "Offers"],
  },
  {
    id: "PRODUCT_RECOMMENDATION",
    keywords: [
      "what should i take",
      "what should i use",
      "suggest",
      "recommend",
      "kaunsa lena chahiye",
      "konsa lena chahiye",
      "kon sa lena chahiye",
      "which fastup",
      "energy ke liye",
      "tiredness",
      "weakness",
      "i run daily",
      "run daily",
      "fastup konsa best",
      "best tablet",
      "best product",
      "what to take",
    ],
    quickReplies: ["Energy", "Hydration", "Muscle", "Daily use", "Workouts"],
  },
  {
    id: "PRODUCT_BENEFITS",
    keywords: [
      "benefits",
      "benefit",
      "what does it do",
      "help with",
      "fayda",
      "faayda",
      "kis ke liye",
      "kaam karta",
    ],
    quickReplies: ["Reload benefits", "Vitamin C benefits", "Whey benefits"],
  },
  {
    id: "USAGE_INSTRUCTIONS",
    keywords: [
      "how to use",
      "how many",
      "dosage",
      "dose",
      "kitna",
      "kab lena",
      "use kaise kare",
      "instructions",
      "serving",
    ],
    quickReplies: ["Reload usage", "Vitamin C usage", "Whey usage"],
  },
  {
    id: "SAFETY_HEALTH",
    keywords: [
      "safe",
      "side effects",
      "side effect",
      "diabetic",
      "diabetes",
      "teenager",
      "pregnant",
      "medical condition",
      "bp patient",
      "is it safe",
    ],
    quickReplies: ["Safe for diabetic?", "Any side effects?", "Teenager use"],
  },
  {
    id: "PURCHASE_AVAILABILITY",
    keywords: [
      "buy",
      "where can i buy",
      "where to buy",
      "where to get",
      "purchase",
      "available",
      "kaha milega",
      "kahaan milega",
      "kahan milega",
      "nearby store",
      "amazon",
    ],
    quickReplies: ["Buy online", "Nearby stores", "Official website"],
  },
  {
    id: "ORDER_TRACKING",
    keywords: [
      "track order",
      "track my order",
      "where is my order",
      "order status",
      "not delivered",
      "late delivery",
      "shipment status",
      "delivery status",
      "order issue",
    ],
    quickReplies: ["Track order", "Not delivered", "Share order ID"],
  },
  {
    id: "OFFERS_DISCOUNTS",
    keywords: [
      "discount",
      "offers",
      "offer",
      "combo",
      "coupon",
      "deal",
      "promo",
      "cashback",
      "sale",
      "discount hai kya",
    ],
    quickReplies: ["Combo offers", "Coupon", "Current deals"],
  },
  {
    id: "THANKS",
    keywords: ["thanks", "thank you", "thx", "great", "helpful"],
    quickReplies: ["Recommend product", "Track order", "Offers"],
  },
];

const GOAL_KEYWORDS = {
  energy: ["energy", "tired", "tiredness", "fatigue", "weak", "weakness", "thakan", "stamina"],
  hydration: ["hydration", "hydrate", "dehydrated", "dehydration", "electrolyte", "water", "pani", "reload"],
  muscle: ["muscle", "protein", "whey", "strength", "recovery", "gain", "workout recovery", "bodybuilding"],
} as const;

const CONTEXT_KEYWORDS = {
  running: ["run", "running", "runner", "jog", "jogging"],
  workout: ["workout", "gym", "training", "exercise"],
  daily: ["daily", "everyday", "regular", "routine"],
} as const;

const PRODUCT_KEYWORDS = {
  vitamin_c: ["vitamin c", "vit c", "c tablet"],
  multivitamin: ["multivitamin", "multi vitamin", "vitalize"],
  reload: ["reload", "electrolyte tablet", "hydration tablet"],
  whey_protein: ["whey", "whey protein", "protein powder"],
} as const;

const MEDICAL_KEYWORDS = [
  "safe",
  "side effect",
  "side effects",
  "diabetic",
  "diabetes",
  "teenager",
  "pregnant",
  "bp",
  "thyroid",
  "medical",
  "condition",
];

const RECOMMENDATION_SIGNALS = [
  "suggest",
  "recommend",
  "best",
  "konsa",
  "kaunsa",
  "kon sa",
  "which",
  "what should",
  "lena",
  "take",
];

const ORDER_SIGNALS = ["order", "track", "delivery", "shipment", "delivered"];
const OFFER_SIGNALS = ["offer", "discount", "coupon", "combo", "deal", "promo", "sale"];

export const START_GREETING = "Namaste! I am Rahul from Fast&Up. How can I help you today?";

export const CALL_OPENING_SCRIPT = START_GREETING;

export const FALLBACK_MESSAGE =
  "I did not fully get that. Are you looking for:\n- Product recommendation\n- Usage\n- Order help\n- Offers";

const CLARIFY_MESSAGE =
  "Could you share a bit more detail?\nIs this about recommendation, usage, order help, or offers?";

const NORMALIZATION_REPLACERS: Array<[RegExp, string]> = [
  [/fast\s*&\s*up/gi, "fastup"],
  [/fast\s*and\s*up/gi, "fastup"],
  [/fastandup/gi, "fastup"],
  [/kaun\s*sa/gi, "kaunsa"],
  [/kon\s*sa/gi, "kaunsa"],
  [/konsa/gi, "kaunsa"],
  [/faayda/gi, "fayda"],
  [/work\s*out/gi, "workout"],
];

function normalizeText(value: string) {
  let normalized = value.toLowerCase();

  for (const [pattern, replacement] of NORMALIZATION_REPLACERS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function editDistanceWithin(a: string, b: string, maxDistance: number) {
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    table[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    table[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    let minInRow = Number.POSITIVE_INFINITY;

    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost
      );

      if (table[i][j] < minInRow) {
        minInRow = table[i][j];
      }
    }

    if (minInRow > maxDistance) {
      return maxDistance + 1;
    }
  }

  return table[rows - 1][cols - 1];
}

function fuzzyTokenMatch(inputToken: string, keywordToken: string) {
  if (inputToken === keywordToken) {
    return true;
  }

  const maxDistance = Math.max(inputToken.length, keywordToken.length) >= 8 ? 2 : 1;
  return editDistanceWithin(inputToken, keywordToken, maxDistance) <= maxDistance;
}

function hasPhrase(normalizedInput: string, phrase: string) {
  const normalizedPhrase = normalizeText(phrase);
  return normalizedPhrase.length > 0 && normalizedInput.includes(normalizedPhrase);
}

function hasKeywordToken(tokens: string[], keyword: string) {
  return tokens.some((token) => fuzzyTokenMatch(token, keyword));
}

function hasAnyKeyword(tokens: string[], keywords: string[]) {
  return keywords.some((keyword) => hasKeywordToken(tokens, keyword));
}

function scoreKeyword(normalizedInput: string, inputTokens: string[], keyword: string) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) {
    return 0;
  }

  if (normalizedInput === normalizedKeyword) {
    return 120;
  }

  if (normalizedInput.includes(normalizedKeyword)) {
    return normalizedKeyword.split(" ").length === 1 ? 95 : 105;
  }

  const keywordTokens = normalizedKeyword.split(" ").filter(Boolean);
  if (keywordTokens.length === 0) {
    return 0;
  }

  let matched = 0;
  for (const keywordToken of keywordTokens) {
    if (inputTokens.some((inputToken) => fuzzyTokenMatch(inputToken, keywordToken))) {
      matched += 1;
    }
  }

  const coverage = matched / keywordTokens.length;

  if (coverage === 1) {
    return keywordTokens.length === 1 ? 86 : 92;
  }

  if (coverage >= 0.67 && keywordTokens.length >= 2) {
    return 76;
  }

  if (coverage >= 0.5 && keywordTokens.length >= 3) {
    return 68;
  }

  return 0;
}

function findGoal(normalizedInput: string, tokens: string[]): RecommendationGoal {
  const goalKeys = Object.keys(GOAL_KEYWORDS) as Array<Exclude<RecommendationGoal, null>>;

  for (const goal of goalKeys) {
    const keywords = GOAL_KEYWORDS[goal];
    if (keywords.some((keyword) => hasPhrase(normalizedInput, keyword) || hasKeywordToken(tokens, keyword))) {
      return goal;
    }
  }

  return null;
}

function findContext(normalizedInput: string, tokens: string[]): UsageContext {
  const contextKeys = Object.keys(CONTEXT_KEYWORDS) as Array<Exclude<UsageContext, null>>;

  for (const context of contextKeys) {
    const keywords = CONTEXT_KEYWORDS[context];
    if (keywords.some((keyword) => hasPhrase(normalizedInput, keyword) || hasKeywordToken(tokens, keyword))) {
      return context;
    }
  }

  return null;
}

function findProduct(normalizedInput: string, tokens: string[]): ProductKey {
  const productKeys = Object.keys(PRODUCT_KEYWORDS) as Array<Exclude<ProductKey, null>>;

  for (const product of productKeys) {
    const keywords = PRODUCT_KEYWORDS[product];
    if (keywords.some((keyword) => hasPhrase(normalizedInput, keyword) || hasKeywordToken(tokens, keyword))) {
      return product;
    }
  }

  return null;
}

function findOrderId(message: string) {
  const explicit = message.match(/\border(?:\s*(?:id|number|#))?\s*[:\-]?\s*([a-z0-9\-]{5,20})/i);
  if (explicit?.[1]) {
    return explicit[1].toUpperCase();
  }

  const tokens = message
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9\-]/gi, ""))
    .filter(Boolean);

  const candidate = tokens.find(
    (token) => token.length >= 6 && /[a-z]/i.test(token) && /\d/.test(token)
  );

  return candidate ? candidate.toUpperCase() : null;
}

function extractEntities(message: string): ExtractedEntities {
  const normalizedInput = normalizeText(message);
  const tokens = tokenize(message);

  return {
    goal: findGoal(normalizedInput, tokens),
    context: findContext(normalizedInput, tokens),
    product: findProduct(normalizedInput, tokens),
    orderId: findOrderId(message),
    hasMedicalSignal: MEDICAL_KEYWORDS.some(
      (keyword) => hasPhrase(normalizedInput, keyword) || hasKeywordToken(tokens, keyword)
    ),
  };
}

function findIntentDefinition(intentId: CoreIntent) {
  return INTENT_DICTIONARY.find((intentDef) => intentDef.id === intentId) ?? null;
}

function detectPendingState(history: RuleAgentMessage[] | undefined): PendingState {
  if (!history || history.length === 0) {
    return null;
  }

  const lastAssistantMessage = [...history]
    .reverse()
    .find((entry) => entry.role === "assistant")?.content;

  if (!lastAssistantMessage) {
    return null;
  }

  const normalizedAssistant = normalizeText(lastAssistantMessage);

  if (normalizedAssistant.includes("what do you need it for")) {
    return "recommendation_goal";
  }

  if (
    normalizedAssistant.includes("daily use or workouts") ||
    normalizedAssistant.includes("daily use workouts or running")
  ) {
    return "recommendation_context";
  }

  if (normalizedAssistant.includes("share your order id")) {
    return "order_id";
  }

  return null;
}

function scoreIntent(
  intentDef: IntentDefinition,
  normalizedInput: string,
  inputTokens: string[],
  entities: ExtractedEntities
) {
  let bestKeywordScore = 0;

  for (const keyword of intentDef.keywords) {
    const score = scoreKeyword(normalizedInput, inputTokens, keyword);
    if (score > bestKeywordScore) {
      bestKeywordScore = score;
    }
  }

  let boost = 0;

  if (intentDef.id === "PRODUCT_RECOMMENDATION") {
    if (entities.goal) boost += 24;
    if (entities.context) boost += 14;
    if (entities.product) boost += 12;
    if (hasAnyKeyword(inputTokens, RECOMMENDATION_SIGNALS)) boost += 20;
  }

  if (intentDef.id === "PRODUCT_BENEFITS" && entities.product) {
    boost += 24;
  }

  if (intentDef.id === "USAGE_INSTRUCTIONS" && entities.product) {
    boost += 20;
  }

  if (intentDef.id === "SAFETY_HEALTH" && entities.hasMedicalSignal) {
    boost += 28;
  }

  if (intentDef.id === "PURCHASE_AVAILABILITY" && hasAnyKeyword(inputTokens, ["buy", "purchase", "available", "amazon", "store"])) {
    boost += 20;
  }

  if (intentDef.id === "ORDER_TRACKING") {
    if (entities.orderId) boost += 35;
    if (hasAnyKeyword(inputTokens, ORDER_SIGNALS)) boost += 22;
  }

  if (intentDef.id === "OFFERS_DISCOUNTS" && hasAnyKeyword(inputTokens, OFFER_SIGNALS)) {
    boost += 24;
  }

  return bestKeywordScore + boost;
}

function detectIntent(message: string, entities: ExtractedEntities): CoreIntent | null {
  const normalizedInput = normalizeText(message);
  const inputTokens = tokenize(message);

  let bestIntent: CoreIntent | null = null;
  let bestScore = 0;

  for (const intentDef of INTENT_DICTIONARY) {
    const score = scoreIntent(intentDef, normalizedInput, inputTokens, entities);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intentDef.id;
    }
  }

  if (!bestIntent) {
    return null;
  }

  if (bestScore >= 74) {
    return bestIntent;
  }

  const hasGoalSignal = entities.goal !== null;
  if (hasGoalSignal && bestIntent === "PRODUCT_RECOMMENDATION") {
    return bestIntent;
  }

  return null;
}

function resolveContextualIntent(
  message: string,
  history: RuleAgentMessage[] | undefined,
  entities: ExtractedEntities
): CoreIntent | null {
  const pendingState = detectPendingState(history);
  const normalizedMessage = normalizeText(message);

  if (!pendingState || !normalizedMessage) {
    return null;
  }

  if (pendingState === "recommendation_goal" && (entities.goal || entities.product)) {
    return "PRODUCT_RECOMMENDATION";
  }

  if (
    pendingState === "recommendation_context" &&
    (entities.context || normalizedMessage === "daily" || normalizedMessage === "workout")
  ) {
    return "PRODUCT_RECOMMENDATION";
  }

  if (pendingState === "order_id" && (entities.orderId || normalizedMessage.includes("not delivered"))) {
    return "ORDER_TRACKING";
  }

  return null;
}

function isUnclearMessage(message: string) {
  const normalized = normalizeText(message);
  if (!normalized) {
    return true;
  }

  const weakMessages = new Set(["h", "ha", "hmm", "ok", "h", "yo", "hii"]);
  return weakMessages.has(normalized);
}

function getRecommendationResponse(entities: ExtractedEntities) {
  const context = entities.context;

  if (entities.goal === "energy") {
    if (context === "workout") {
      return {
        text: "For workout energy, try Multivitamin daily and Vitamin C for recovery support.\nDo you want a simple timing plan before and after workouts?",
        quickReplies: ["Workout timing", "Daily use", "Usage instructions"],
      };
    }

    if (context === "running") {
      return {
        text: "For running energy, Vitamin C or Multivitamin are good daily options.\nDo you also want hydration support like Reload for runs?",
        quickReplies: ["Hydration for runs", "Vitamin C usage", "Reload usage"],
      };
    }

    return {
      text: "For energy, you can try Vitamin C or Multivitamin.\nIs this for daily use or workouts?",
      quickReplies: ["Daily use", "Workouts", "Vitamin C usage"],
    };
  }

  if (entities.goal === "hydration") {
    if (context === "workout" || context === "running") {
      return {
        text: "For hydration during workouts or runs, Fast&Up Reload works best.\nDo you want pre-workout or post-workout usage guidance?",
        quickReplies: ["Pre-workout", "Post-workout", "Reload usage"],
      };
    }

    return {
      text: "For hydration, Fast&Up Reload is the best fit.\nIs this for workouts or daily use?",
      quickReplies: ["Workouts", "Daily use", "Reload benefits"],
    };
  }

  if (entities.goal === "muscle") {
    return {
      text: "For muscle gain and recovery, Whey Protein is the best option.\nAre you looking for post-workout use or daily protein support?",
      quickReplies: ["Post-workout use", "Daily protein", "Whey usage"],
    };
  }

  if (entities.product === "reload") {
    return {
      text: "If your goal is hydration and endurance, choose Fast&Up Reload.\nIs this mainly for workouts or outdoor running?",
      quickReplies: ["Workouts", "Running", "Reload benefits"],
    };
  }

  if (entities.product === "whey_protein") {
    return {
      text: "If your goal is muscle and recovery, Whey Protein is a strong choice.\nDo you want usage steps for gym days?",
      quickReplies: ["Whey usage", "Gym days", "Muscle recovery"],
    };
  }

  if (context === "running") {
    return {
      text: "Since you run daily, start with Reload for hydration and add Vitamin C for energy support.\nIs your main goal endurance or recovery?",
      quickReplies: ["Endurance", "Recovery", "Reload usage"],
    };
  }

  if (context === "workout") {
    return {
      text: "For regular workouts, a simple stack is Reload for hydration plus Whey Protein for recovery.\nDo you want a pre-workout or post-workout plan?",
      quickReplies: ["Pre-workout", "Post-workout", "Usage instructions"],
    };
  }

  if (context === "daily") {
    return {
      text: "For daily wellness, Vitamin C or Multivitamin are good starting options.\nDo you also need hydration support for activity days?",
      quickReplies: ["Add hydration", "Only daily use", "Vitamin C usage"],
    };
  }

  return {
    text: "Depends on your goal: Energy -> Vitamin C or Multivitamin, Hydration -> Reload, Muscle -> Whey Protein.\nWhat do you need it for?",
    quickReplies: ["Energy", "Hydration", "Muscle"],
  };
}

function getBenefitsResponse(entities: ExtractedEntities) {
  if (entities.product === "reload" || entities.goal === "hydration") {
    return {
      text: "Fast&Up Reload helps replenish electrolytes and reduces dehydration after workouts.\nDo you want to know when to take it for best results?",
      quickReplies: ["Reload usage", "Workout timing", "Buy Reload"],
    };
  }

  if (entities.product === "whey_protein" || entities.goal === "muscle") {
    return {
      text: "Whey Protein supports muscle recovery and helps meet daily protein needs.\nDo you want post-workout usage guidance?",
      quickReplies: ["Whey usage", "Post-workout", "Buy Whey"],
    };
  }

  if (entities.product === "vitamin_c" || entities.product === "multivitamin" || entities.goal === "energy") {
    return {
      text: "Vitamin C and Multivitamin support daily immunity and help with tiredness support.\nWould you like the right option for daily use or workouts?",
      quickReplies: ["Daily use", "Workouts", "Usage instructions"],
    };
  }

  return {
    text: "I can explain benefits clearly for Reload, Vitamin C, Multivitamin, or Whey Protein.\nWhich product do you want to know about?",
    quickReplies: ["Reload", "Vitamin C", "Whey Protein"],
  };
}

function getUsageResponse(entities: ExtractedEntities) {
  if (entities.product === "reload" || entities.goal === "hydration") {
    return {
      text: "Use 1 Reload tablet in 250 ml water during or after workout.\nDo you want guidance for running days or gym days?",
      quickReplies: ["Running days", "Gym days", "Reload benefits"],
    };
  }

  if (entities.product === "whey_protein" || entities.goal === "muscle") {
    return {
      text: "Use 1 scoop Whey Protein with water or milk after workout, or once daily.\nDo you train daily or only on specific days?",
      quickReplies: ["Daily training", "Specific days", "Whey benefits"],
    };
  }

  if (entities.product === "vitamin_c" || entities.product === "multivitamin" || entities.goal === "energy") {
    return {
      text: "Usually, dissolve 1 tablet in water once daily; follow label instructions.\nIs this for morning routine or post-workout use?",
      quickReplies: ["Morning routine", "Post-workout", "Energy recommendation"],
    };
  }

  return {
    text: "Usually 1 tablet in water once or twice daily, based on label instructions.\nWhich product should I give exact usage for?",
    quickReplies: ["Reload usage", "Vitamin C usage", "Whey usage"],
  };
}

function getSafetyResponse(entities: ExtractedEntities) {
  const productName =
    entities.product === "reload"
      ? "Reload"
      : entities.product === "whey_protein"
      ? "Whey Protein"
      : entities.product === "vitamin_c"
      ? "Vitamin C"
      : entities.product === "multivitamin"
      ? "Multivitamin"
      : "These products";

  const safetyPrefix =
    entities.product === null
      ? `${productName} are generally safe when used as directed.`
      : `${productName} is generally safe when used as directed.`;

  return {
    text: `${safetyPrefix}\nIf you have diabetes or any medical condition, please consult your doctor first.\nDo you want product-specific usage guidance as well?`,
    quickReplies: ["Usage instructions", "Side effects", "Recommend product"],
  };
}

function getPurchaseResponse() {
  return {
    text: "You can buy from the Fast&Up website, Amazon, or nearby stores.\nDo you want online links or nearby store guidance?",
    quickReplies: ["Buy online", "Nearby store", "Current offers"],
  };
}

function getOrderTrackingResponse(entities: ExtractedEntities) {
  if (entities.orderId) {
    return {
      text: `Thanks, I noted order ID ${entities.orderId}. Please check your tracking link for the latest status.\nIs it delayed or marked delivered but not received?`,
      quickReplies: ["Delayed", "Not received", "Order issue"],
    };
  }

  return {
    text: "Please share your order ID so I can help track it.\nIs the issue delayed delivery or not delivered?",
    quickReplies: ["Share order ID", "Delayed", "Not delivered"],
  };
}

function getOffersResponse() {
  return {
    text: "We have combo offers available. Check our website for current deals.\nDo you want combo deals or single-product discounts?",
    quickReplies: ["Combo deals", "Single-product discount", "Coupon help"],
  };
}

function getGreetingResponse() {
  return {
    text: "Namaste! I am Rahul from Fast&Up.\nWhat can I help you with today: recommendation, usage, order help, or offers?",
    quickReplies: ["Recommend product", "How to use", "Track order", "Offers"],
  };
}

function getThanksResponse() {
  return {
    text: "Happy to help.\nDo you want product recommendation, usage help, order tracking, or offers next?",
    quickReplies: ["Recommend product", "Usage help", "Track order", "Offers"],
  };
}

function buildResponse(intent: CoreIntent, entities: ExtractedEntities) {
  switch (intent) {
    case "GREETING":
      return getGreetingResponse();
    case "PRODUCT_RECOMMENDATION":
      return getRecommendationResponse(entities);
    case "PRODUCT_BENEFITS":
      return getBenefitsResponse(entities);
    case "USAGE_INSTRUCTIONS":
      return getUsageResponse(entities);
    case "SAFETY_HEALTH":
      return getSafetyResponse(entities);
    case "PURCHASE_AVAILABILITY":
      return getPurchaseResponse();
    case "ORDER_TRACKING":
      return getOrderTrackingResponse(entities);
    case "OFFERS_DISCOUNTS":
      return getOffersResponse();
    case "THANKS":
      return getThanksResponse();
    default:
      return null;
  }
}

function pickQuickReplies(intentId: CoreIntent, fallbackReplies: string[]) {
  const intentDef = findIntentDefinition(intentId);
  if (!intentDef) {
    return fallbackReplies;
  }

  const merged = [...fallbackReplies, ...intentDef.quickReplies, ...DEFAULT_QUICK_REPLIES];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of merged) {
    const key = item.toLowerCase().trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);

    if (result.length >= 8) {
      break;
    }
  }

  return result;
}

function pickClarifyMessage(message: string) {
  const seed = normalizeText(message) || "clarify";
  const variants = [
    CLARIFY_MESSAGE,
    "I want to help, but I need one more detail.\nIs this about recommendation, usage, order help, or offers?",
    "Please share your goal in one line.\nFor example: energy, hydration, order tracking, or discount.",
  ];

  return variants[stableHash(seed) % variants.length];
}

export function getRuleBasedReply(message: string, history?: RuleAgentMessage[]): RuleAgentResult {
  if (isUnclearMessage(message)) {
    return {
      mode: "clarify",
      message: pickClarifyMessage(message),
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  const entities = extractEntities(message);
  const detectedIntent = detectIntent(message, entities);
  const contextualIntent = resolveContextualIntent(message, history, entities);
  const intent = detectedIntent ?? contextualIntent;

  if (intent) {
    const response = buildResponse(intent, entities);
    if (response) {
      return {
        mode: "matched",
        message: response.text,
        quickReplies: pickQuickReplies(intent, response.quickReplies),
        matchedIntentId: intent,
      };
    }
  }

  return {
    mode: "fallback",
    message: FALLBACK_MESSAGE,
    quickReplies: ["Product recommendation", "Usage", "Order help", "Offers"],
  };
}

export const RULE_BASE_SIZE = INTENT_DICTIONARY.length;
