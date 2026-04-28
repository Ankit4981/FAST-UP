import { seedProducts } from "@/data/seed";

export type AgentMatchMode = "matched" | "clarify" | "fallback";

export type RuleIntent = {
  id: string;
  category:
    | "product"
    | "usage"
    | "pricing"
    | "orders"
    | "delivery"
    | "returns"
    | "health"
    | "greeting"
    | "support";
  trigger: string;
  response: string;
  quickReplies: string[];
};

export type RuleAgentResult = {
  mode: AgentMatchMode;
  message: string;
  quickReplies: string[];
  matchedIntentId?: string;
  matchedTrigger?: string;
};

export const CALL_OPENING_SCRIPT =
  "Namaste, my name is Rahul. I'm calling from Fast&Up. How can I help you today?";

export const FALLBACK_MESSAGE =
  "I'm sorry, I didn't understand that. Could you please rephrase your question?";

const CLARIFY_MESSAGE =
  "Please share your question clearly in one short line so I can help you better.";

const DEFAULT_QUICK_REPLIES = [
  "Product benefits",
  "How to use",
  "Track order",
  "Offers",
];

const PRODUCT_QUICK_REPLIES = [
  "Benefits",
  "How to use",
  "Ingredients",
  "Price",
];

const ORDER_QUICK_REPLIES = [
  "Track order",
  "Delivery time",
  "Return policy",
  "Talk to support",
];

type ProductProfile = {
  key: string;
  name: string;
  benefit: string;
  usage: string;
  ingredients: string;
  price: string;
  timing: string;
  vegan: string;
  bestFor: string;
  dailyUse: string;
  caution: string;
  goal: string;
};

const productPriceByName = new Map(seedProducts.map((product) => [product.name, product.price]));

const PRODUCT_PROFILES: ProductProfile[] = [
  {
    key: "reload",
    name: "Fast&Up Reload",
    benefit:
      "Fast&Up Reload helps you stay hydrated and keeps your energy steady during workouts.",
    usage: "Drop one tablet in 250 ml water and sip during activity.",
    ingredients: "It includes five electrolytes and vitamin C with zero added sugar.",
    price: `Current store price is Rs ${productPriceByName.get("Fast&Up Reload") ?? 559}.`,
    timing: "Use it during workouts, runs, travel, or hot weather.",
    vegan: "Yes, Fast&Up Reload is vegan.",
    bestFor: "It is best for hydration, endurance support, and cramp prevention.",
    dailyUse: "You can use one serving daily when hydration support is needed.",
    caution: "Use as directed and consult your doctor if you have a medical condition.",
    goal: "It supports hydration and sustained performance.",
  },
  {
    key: "activate",
    name: "Activate Pre-Workout",
    benefit: "Activate Pre-Workout boosts workout energy, focus, and training intensity.",
    usage: "Drop one tablet in 250 ml water and drink 20 minutes before training.",
    ingredients: "It includes caffeine, beta alanine, and B vitamins.",
    price: `Current store price is Rs ${productPriceByName.get("Activate Pre-Workout") ?? 749}.`,
    timing: "Use it before gym or high-intensity training sessions.",
    vegan: "Yes, Activate Pre-Workout is vegan.",
    bestFor: "It is best for strength days, intense workouts, and focus.",
    dailyUse: "Take one serving per day on training days.",
    caution: "Avoid late-night use if you are sensitive to caffeine.",
    goal: "It helps improve training drive and workout output.",
  },
  {
    key: "vitalize",
    name: "Vitalize Multivitamin",
    benefit: "Vitalize Multivitamin supports daily immunity, energy, and overall wellness.",
    usage: "Take one tablet in 250 ml water after breakfast.",
    ingredients: "It has essential vitamins and minerals including vitamin D3 and zinc.",
    price: `Current store price is Rs ${productPriceByName.get("Vitalize Multivitamin") ?? 479}.`,
    timing: "Use once daily, preferably after breakfast.",
    vegan: "This formula is vegetarian-friendly.",
    bestFor: "It is best for busy routines and micronutrient support.",
    dailyUse: "Yes, it is designed for daily use.",
    caution: "Do not exceed the suggested serving unless advised by your doctor.",
    goal: "It supports immunity and daily energy metabolism.",
  },
  {
    key: "recover",
    name: "Recover BCAA + Glutamine",
    benefit: "Recover BCAA + Glutamine helps reduce soreness and speeds up recovery.",
    usage: "Mix one scoop in 400 ml water and drink after workout.",
    ingredients: "It provides BCAA, glutamine, electrolytes, and vitamin C.",
    price: `Current store price is Rs ${productPriceByName.get("Recover BCAA + Glutamine") ?? 799}.`,
    timing: "Use it after training for post-workout recovery support.",
    vegan: "Yes, this formula is vegan.",
    bestFor: "It is best for muscle recovery and repeated weekly training.",
    dailyUse: "You can use it after each workout session.",
    caution: "Use the recommended serving and stay hydrated.",
    goal: "It supports recovery quality and muscle repair.",
  },
  {
    key: "plant-protein",
    name: "Plant Protein Performance",
    benefit:
      "Plant Protein Performance supports lean muscle growth and better daily recovery.",
    usage: "Shake one scoop in 250 ml water or milk after workout.",
    ingredients: "It includes pea protein, brown rice protein, and digestive enzymes.",
    price: `Current store price is Rs ${productPriceByName.get("Plant Protein Performance") ?? 1499}.`,
    timing: "Use post-workout or between meals for protein support.",
    vegan: "Yes, it is 100% plant-based and vegan.",
    bestFor: "It is best for vegan muscle support and clean protein intake.",
    dailyUse: "Yes, one serving daily can support your protein target.",
    caution: "Pair with balanced meals and enough water for best results.",
    goal: "It helps you recover and build lean muscle with vegan protein.",
  },
  {
    key: "whey-protein",
    name: "Fast&Up Whey Protein",
    benefit:
      "Fast&Up Whey Protein helps build lean muscle and recover faster after workouts.",
    usage: "Mix one scoop in 250 ml chilled water after training.",
    ingredients: "It offers whey isolate blend, high protein, and natural BCAA support.",
    price: `Current store price is Rs ${productPriceByName.get("Fast&Up Whey Protein") ?? 1699}.`,
    timing: "Use it after workout or between meals.",
    vegan: "No, whey protein is dairy-based and not vegan.",
    bestFor: "It is best for gym users focused on strength and muscle gain.",
    dailyUse: "Yes, one serving daily can help meet protein goals.",
    caution: "If you are lactose-sensitive, start with a smaller serving.",
    goal: "It supports strength gains, recovery, and muscle maintenance.",
  },
  {
    key: "vitamin-c",
    name: "Fast&Up Vitamin C",
    benefit: "Fast&Up Vitamin C supports immunity and helps recovery from daily stress.",
    usage: "Take one tablet in 250 ml water after breakfast.",
    ingredients: "It contains vitamin C, zinc, and antioxidant support.",
    price: `Current store price is Rs ${productPriceByName.get("Fast&Up Vitamin C") ?? 449}.`,
    timing: "Use once daily, preferably after breakfast.",
    vegan: "Yes, this formula is vegan.",
    bestFor: "It is best for daily immunity and seasonal wellness support.",
    dailyUse: "Yes, it is designed for daily use.",
    caution: "Use only the suggested serving and consult your doctor if needed.",
    goal: "It helps strengthen daily immune support.",
  },
  {
    key: "collagen-glow",
    name: "Collagen Glow",
    benefit: "Collagen Glow supports skin hydration, hair strength, and daily glow.",
    usage: "Dissolve one tablet in 250 ml water once daily.",
    ingredients: "It includes collagen peptides, biotin, vitamin C, and antioxidants.",
    price: `Current store price is Rs ${productPriceByName.get("Collagen Glow") ?? 899}.`,
    timing: "Use once daily at a fixed time.",
    vegan: "No, collagen formulas are usually not vegan.",
    bestFor: "It is best for skin, hair, and nail support.",
    dailyUse: "Yes, daily use gives better beauty nutrition results.",
    caution: "Use as directed and stop if any discomfort appears.",
    goal: "It helps support beauty-from-within nutrition.",
  },
  {
    key: "kidz-immunity",
    name: "Kidz Immunity Fizz",
    benefit: "Kidz Immunity Fizz supports kids' immunity and active growth.",
    usage: "Dissolve in water and serve as directed on pack with adult supervision.",
    ingredients: "It provides vitamin C, zinc, and vitamin D3 with kid-friendly flavor.",
    price: `Current store price is Rs ${productPriceByName.get("Kidz Immunity Fizz") ?? 399}.`,
    timing: "Use once daily as directed on the pack.",
    vegan: "Please check the label variant for dietary preference details.",
    bestFor: "It is best for kids who need daily immunity nutrition support.",
    dailyUse: "Yes, use only the suggested serving for your child's age.",
    caution: "Always use under adult supervision and follow the pack instructions.",
    goal: "It supports daily immune strength for kids.",
  },
  {
    key: "marathon-bundle",
    name: "Marathon Hydration Bundle",
    benefit:
      "Marathon Hydration Bundle supports energy, hydration, and recovery in one stack.",
    usage:
      "Use Activate before, Reload during, and Recover after endurance sessions.",
    ingredients: "It combines pre-workout, electrolytes, and recovery nutrition.",
    price: `Current store price is Rs ${productPriceByName.get("Marathon Hydration Bundle") ?? 1299}.`,
    timing: "Use it for race week and long endurance training.",
    vegan: "Most included products are vegan; check each pack for details.",
    bestFor: "It is best for runners, cyclists, and endurance athletes.",
    dailyUse: "Use each product as per training schedule and pack directions.",
    caution: "Follow each product's serving guide for safe use.",
    goal: "It improves race-day readiness and recovery.",
  },
];

type ProductTemplate = {
  key: string;
  trigger: (profile: ProductProfile) => string;
  response: (profile: ProductProfile) => string;
};

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    key: "what-is",
    trigger: (profile) => `what is ${profile.name}`,
    response: (profile) => profile.benefit,
  },
  {
    key: "benefits",
    trigger: (profile) => `benefits of ${profile.name}`,
    response: (profile) => profile.benefit,
  },
  {
    key: "how-to-use",
    trigger: (profile) => `how to use ${profile.name}`,
    response: (profile) => profile.usage,
  },
  {
    key: "best-time",
    trigger: (profile) => `best time to take ${profile.name}`,
    response: (profile) => profile.timing,
  },
  {
    key: "ingredients",
    trigger: (profile) => `ingredients in ${profile.name}`,
    response: (profile) => profile.ingredients,
  },
  {
    key: "price",
    trigger: (profile) => `price of ${profile.name}`,
    response: (profile) => profile.price,
  },
  {
    key: "vegan",
    trigger: (profile) => `is ${profile.name} vegan`,
    response: (profile) => profile.vegan,
  },
  {
    key: "best-for",
    trigger: (profile) => `who should use ${profile.name}`,
    response: (profile) => profile.bestFor,
  },
  {
    key: "daily-use",
    trigger: (profile) => `can i take ${profile.name} daily`,
    response: (profile) => profile.dailyUse,
  },
  {
    key: "safety",
    trigger: (profile) => `is ${profile.name} safe`,
    response: (profile) => profile.caution,
  },
  {
    key: "goal",
    trigger: (profile) => `does ${profile.name} help with performance`,
    response: (profile) => profile.goal,
  },
  {
    key: "results-time",
    trigger: (profile) => `how long for results with ${profile.name}`,
    response: () =>
      "Most users feel benefits in 1-2 weeks with regular use and proper hydration.",
  },
];

type SupportTopic = {
  key: string;
  category: RuleIntent["category"];
  prompts: [string, string];
  response: string;
  quickReplies: string[];
};

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    key: "greeting",
    category: "greeting",
    prompts: ["hi", "namaste"],
    response: "Namaste! I am Fast&Up Assistant Rahul. How can I help you today?",
    quickReplies: DEFAULT_QUICK_REPLIES,
  },
  {
    key: "help",
    category: "support",
    prompts: ["help me", "i need help"],
    response: "Sure. Please choose product info, order help, delivery, or returns.",
    quickReplies: ["Product info", "Order help", "Delivery", "Returns"],
  },
  {
    key: "best-hydration",
    category: "product",
    prompts: ["best product for hydration", "which product for hydration"],
    response: "Fast&Up Reload helps you stay hydrated and active for longer.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "best-energy",
    category: "product",
    prompts: ["best product for energy", "which product for energy"],
    response: "Activate Pre-Workout boosts workout energy and focus.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "best-recovery",
    category: "product",
    prompts: ["best product for recovery", "which product for recovery"],
    response: "Recover BCAA + Glutamine supports faster recovery and less soreness.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "best-muscle",
    category: "product",
    prompts: ["best product for muscle gain", "which product for muscle gain"],
    response: "Fast&Up Whey Protein supports lean muscle gain and strength recovery.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "best-immunity",
    category: "product",
    prompts: ["best product for immunity", "which product for immunity"],
    response: "Fast&Up Vitamin C supports strong daily immunity.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "best-skin",
    category: "product",
    prompts: ["best product for skin glow", "which product for skin"],
    response: "Collagen Glow supports skin hydration, hair strength, and daily glow.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "usage-tablet",
    category: "usage",
    prompts: ["how to use effervescent tablets", "how to use tablet"],
    response: "Drop one tablet in water, wait for fizz to settle, then drink.",
    quickReplies: ["Water quantity", "Best time", "Daily use", "Next question"],
  },
  {
    key: "usage-water",
    category: "usage",
    prompts: ["how much water for one tablet", "tablet in how much water"],
    response: "Use around 250 ml water unless the pack says otherwise.",
    quickReplies: ["Before workout", "During workout", "After workout", "Daily use"],
  },
  {
    key: "usage-swallow",
    category: "usage",
    prompts: ["can i swallow tablet directly", "can i eat tablet directly"],
    response: "No. Always dissolve the tablet fully in water before drinking.",
    quickReplies: ["How to use", "Water quantity", "Best time", "Other question"],
  },
  {
    key: "usage-before-workout",
    category: "usage",
    prompts: ["what to take before workout", "pre workout recommendation"],
    response: "Activate Pre-Workout helps improve energy and focus before exercise.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "usage-during-workout",
    category: "usage",
    prompts: ["what to take during workout", "during workout supplement"],
    response: "Fast&Up Reload helps maintain hydration and energy during workouts.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "usage-after-workout",
    category: "usage",
    prompts: ["what to take after workout", "post workout supplement"],
    response: "Recover BCAA + Glutamine helps reduce soreness after workouts.",
    quickReplies: PRODUCT_QUICK_REPLIES,
  },
  {
    key: "usage-multiple",
    category: "usage",
    prompts: [
      "can i take multiple fastup products in one day",
      "can i use multiple products",
    ],
    response: "Yes, if you follow each serving guide and avoid excess intake.",
    quickReplies: ["Daily use", "Serving size", "Safety", "Other question"],
  },
  {
    key: "usage-results",
    category: "usage",
    prompts: ["when will i see results", "how fast does it work"],
    response: "Most users notice benefits in 1-2 weeks with regular use.",
    quickReplies: ["Best product", "How to use", "Daily use", "Other question"],
  },
  {
    key: "order-track",
    category: "orders",
    prompts: ["track my order", "where is my order"],
    response: "Please share your order ID, and I will guide the tracking steps.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-cancel",
    category: "orders",
    prompts: ["how to cancel order", "cancel my order"],
    response: "You can request cancellation before dispatch through support.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-address",
    category: "orders",
    prompts: ["can i change delivery address", "change my delivery address"],
    response: "Address changes are possible before dispatch. Please contact support quickly.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-delay",
    category: "orders",
    prompts: ["my order is delayed", "order taking too long"],
    response: "Sorry for the delay. Please share your order ID for an updated status.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-damaged",
    category: "orders",
    prompts: ["received damaged product", "product arrived damaged"],
    response: "Please share package and product photos for quick replacement support.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-wrong",
    category: "orders",
    prompts: ["received wrong product", "wrong item delivered"],
    response: "Sorry for this. Please share order details and product photo for support.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-partial",
    category: "orders",
    prompts: ["received partial order", "missing item in order"],
    response: "Please share your order ID and missing item details for quick help.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "order-refund-status",
    category: "orders",
    prompts: ["check my refund status", "refund tracking"],
    response: "Please share your order ID to check the current refund stage.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "delivery-time",
    category: "delivery",
    prompts: ["how long does delivery take", "delivery timeline"],
    response: "Metro delivery is usually 2-4 days and other locations 4-7 business days.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "delivery-pincode",
    category: "delivery",
    prompts: ["do you deliver to my pincode", "delivery availability for pincode"],
    response: "Please share your pincode, and support can confirm availability.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "delivery-express",
    category: "delivery",
    prompts: ["is express delivery available", "same day delivery available"],
    response: "Express delivery depends on location and current serviceability.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "return-policy",
    category: "returns",
    prompts: ["what is your return policy", "can i return product"],
    response: "Unopened products are usually returnable within 7 days after delivery.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "return-opened",
    category: "returns",
    prompts: ["can i return opened product", "opened product return"],
    response: "Opened consumables are usually not returnable unless damaged or incorrect.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "return-request",
    category: "returns",
    prompts: ["how to request return", "raise return request"],
    response: "Share order ID and issue details with support to start return process.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "refund-time",
    category: "returns",
    prompts: ["when will i get refund", "refund processing time"],
    response: "Approved refunds are usually initiated within 3-5 business days.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "pricing-offers",
    category: "pricing",
    prompts: ["do you have discount", "what offers are live today"],
    response: "Offers change regularly. Please check the latest deal at checkout.",
    quickReplies: ["Current offers", "Coupon code", "Bundle savings", "Other question"],
  },
  {
    key: "pricing-coupon",
    category: "pricing",
    prompts: ["how to apply coupon", "coupon not working"],
    response: "Enter your code at checkout and check code validity and expiry.",
    quickReplies: ["Current offers", "Checkout help", "Talk to support", "Other question"],
  },
  {
    key: "pricing-cod",
    category: "pricing",
    prompts: ["is cash on delivery available", "cod available"],
    response: "COD availability depends on your delivery location and order value.",
    quickReplies: ORDER_QUICK_REPLIES,
  },
  {
    key: "pricing-payment",
    category: "pricing",
    prompts: ["what payment methods are available", "how can i pay"],
    response: "You can usually pay using prepaid methods and COD where available.",
    quickReplies: ["COD available", "Order help", "Checkout help", "Other question"],
  },
  {
    key: "health-pregnancy",
    category: "health",
    prompts: [
      "can i use fastup during pregnancy",
      "can i use fastup while breastfeeding",
    ],
    response: "Please consult your doctor before using supplements during this phase.",
    quickReplies: ["Ingredients", "Daily use", "Talk to support", "Other question"],
  },
  {
    key: "health-condition",
    category: "health",
    prompts: [
      "i have a medical condition can i use fastup",
      "can i take fastup with medicines",
    ],
    response: "Please consult your doctor before starting supplements with medicines or conditions.",
    quickReplies: ["Ingredients", "Safety", "Talk to support", "Other question"],
  },
  {
    key: "support-human",
    category: "support",
    prompts: ["connect me to human agent", "talk to support agent"],
    response: "Sure. Please share issue type and order ID for priority support.",
    quickReplies: ["Order issue", "Delivery issue", "Refund issue", "Product issue"],
  },
  {
    key: "support-contact",
    category: "support",
    prompts: ["how can i contact support", "customer care help"],
    response: "Please share your query type and order ID if available for faster support.",
    quickReplies: ["Order help", "Delivery help", "Return help", "Product help"],
  },
  {
    key: "support-thanks",
    category: "support",
    prompts: ["thank you", "thanks"],
    response: "You're welcome. Happy to help with your next Fast&Up question.",
    quickReplies: DEFAULT_QUICK_REPLIES,
  },
];

function buildProductIntents(): RuleIntent[] {
  const intents: RuleIntent[] = [];

  for (const profile of PRODUCT_PROFILES) {
    for (const template of PRODUCT_TEMPLATES) {
      intents.push({
        id: `product-${profile.key}-${template.key}`,
        category: "product",
        trigger: template.trigger(profile),
        response: template.response(profile),
        quickReplies: PRODUCT_QUICK_REPLIES,
      });
    }
  }

  return intents;
}

function buildSupportIntents(): RuleIntent[] {
  const intents: RuleIntent[] = [];

  for (const topic of SUPPORT_TOPICS) {
    for (let index = 0; index < topic.prompts.length; index += 1) {
      intents.push({
        id: `support-${topic.key}-${index + 1}`,
        category: topic.category,
        trigger: topic.prompts[index],
        response: topic.response,
        quickReplies: topic.quickReplies,
      });
    }
  }

  return intents;
}

export const RULE_BASE: RuleIntent[] = [...buildProductIntents(), ...buildSupportIntents()];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUnclearInput(message: string) {
  const normalized = normalizeText(message);
  if (!normalized) return true;

  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 0) return true;

  const weakWords = new Set(["hmm", "ok", "h", "hii", "yo", "test"]);

  if (words.length === 1 && weakWords.has(words[0])) return true;
  if (words.length === 1 && words[0].length <= 2) return true;

  return false;
}

function findIntent(message: string) {
  const normalizedMessage = normalizeText(message);

  for (const intent of RULE_BASE) {
    const normalizedTrigger = normalizeText(intent.trigger);

    if (normalizedMessage === normalizedTrigger) {
      return intent;
    }

    if (normalizedTrigger.length >= 8 && normalizedMessage.includes(normalizedTrigger)) {
      return intent;
    }
  }

  return null;
}

export function getRuleBasedReply(message: string): RuleAgentResult {
  if (isUnclearInput(message)) {
    return {
      mode: "clarify",
      message: CLARIFY_MESSAGE,
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  const intent = findIntent(message);

  if (!intent) {
    return {
      mode: "fallback",
      message: FALLBACK_MESSAGE,
      quickReplies: DEFAULT_QUICK_REPLIES,
    };
  }

  return {
    mode: "matched",
    message: intent.response,
    quickReplies: intent.quickReplies,
    matchedIntentId: intent.id,
    matchedTrigger: intent.trigger,
  };
}

export const RULE_BASE_SIZE = RULE_BASE.length;
