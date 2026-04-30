export type AgentMatchMode = "matched" | "clarify" | "fallback";

type IntentCategory =
  | "greeting"
  | "goodbye"
  | "help"
  | "thanks"
  | "error"
  | "confirmation"
  | "denial"
  | "instructions"
  | "unknown"
  | "small_talk"
  | "contact_support"
  | "product_recommendation"
  | "affordable_products"
  | "premium_products"
  | "product_comparison"
  | "order_tracking"
  | "order_issue"
  | "pricing"
  | "account"
  | "payment"
  | "returns"
  | "benefits"
  | "usage"
  | "ingredients"
  | "orders"
  | "offers"
  | "delivery"
  | "fallback";

type IntentDefinition = {
  id: string;
  category: IntentCategory;
  triggers: string[];
  responses: string[];
  priority: number;
};

export type RuleAgentResult = {
  mode: AgentMatchMode;
  message: string;
  quickReplies: string[];
  matchedIntentId?: string;
};

const QUICK_REPLIES = ["Product benefits", "How to use", "Track order", "Offers"];

const OPTIONS_LINE =
  "You can ask about: Product benefits, How to use, Track order, Offers";

export const START_GREETING =
  "Namaste! I am Rahul from Fast&Up. How can I help you today?";

export const CALL_OPENING_SCRIPT = START_GREETING;

export const FALLBACK_MESSAGE = "Sorry, I didn't understand. Please rephrase.";

const CLARIFY_MESSAGE = "Could you please clarify your question?";

function intent(
  id: string,
  category: IntentCategory,
  triggers: string[],
  response: string | string[],
  priority = 1
): IntentDefinition {
  return {
    id,
    category,
    triggers,
    responses: Array.isArray(response) ? response : [response],
    priority,
  };
}

const greetingIntents: IntentDefinition[] = [
  intent("greeting_1", "greeting", ["hi", "hello"], "Hello! How can I help you today?", 9),
  intent("greeting_2", "greeting", ["hey"], "Hey! How can I assist you?", 9),
  intent("greeting_3", "greeting", ["namaste"], "Namaste! How can I help you today?", 9),
  intent(
    "greeting_4",
    "greeting",
    ["good morning"],
    "Good morning! How can I help you?",
    9
  ),
  intent(
    "greeting_5",
    "greeting",
    ["good evening"],
    "Good evening! How can I assist you?",
    9
  ),
  intent(
    "greeting_6",
    "greeting",
    ["good afternoon"],
    "Good afternoon! What can I do for you?",
    9
  ),
  intent(
    "greeting_7",
    "greeting",
    ["hello rahul"],
    "Hello! Rahul here from Fast&Up. How can I help?",
    9
  ),
  intent(
    "greeting_8",
    "greeting",
    ["hi fastandup", "hi fast and up"],
    "Hi! How can I assist you today?",
    9
  ),
  intent(
    "greeting_9",
    "greeting",
    ["start"],
    "Namaste! I am Rahul from Fast&Up. How can I help you?",
    9
  ),
  intent(
    "greeting_10",
    "greeting",
    ["help"],
    "You can ask about products, usage, orders, or offers.",
    3
  ),
];

const conversationalSupportIntents: IntentDefinition[] = [
  intent(
    "greeting_general",
    "greeting",
    ["hello", "hi", "hey", "greetings", "hello there", "hey there"],
    [
      "Hello! How can I assist you today?",
      "Hi there! What can I do for you?",
      "Hey! Need any help?",
      "Greetings! How may I help?",
      "Hi! What's up?",
      "Hello! How can I support you?",
      "Hey there! What do you need?",
      "Hi! Ask me anything.",
      "Hello! Ready to help.",
      "Hey! Let's get started.",
      "Namaste! I'm here to help with anything Fast&Up."
    ],
    10
  ),
  intent(
    "goodbye_general",
    "goodbye",
    ["goodbye", "bye", "see you", "take care", "catch you later", "bye bye"],
    [
      "Goodbye! Have a great day.",
      "See you soon!",
      "Take care!",
      "Bye! Come back anytime.",
      "Catch you later!",
      "Have a nice day!",
      "Goodbye! Stay safe.",
      "See you again!",
      "Bye! Thanks for visiting.",
      "Take it easy!",
      "Thanks for chatting. See you soon!"
    ],
    10
  ),
  intent(
    "help_general",
    "help",
    ["help", "need help", "can you help", "assist me", "support me", "i need support"],
    [
      "Sure, what do you need help with?",
      "I'm here to assist you.",
      "Tell me your issue.",
      "How can I support you?",
      "What's the problem?",
      "Describe your concern.",
      "I'll do my best to help.",
      "Go ahead, I'm listening.",
      "What do you need?",
      "Let me know your question.",
      "Share the details and I'll guide you step by step."
    ],
    10
  ),
  intent(
    "thanks_general",
    "thanks",
    ["thanks", "thank you", "thx", "thanks a lot", "appreciate it"],
    [
      "You're welcome!",
      "Glad I could help.",
      "Anytime!",
      "No problem!",
      "Happy to help!",
      "It's my pleasure.",
      "Don't mention it.",
      "Always here for you.",
      "Cheers!",
      "You're welcome.",
      "Happy to support you whenever you need."
    ],
    10
  ),
  intent(
    "error_general",
    "error",
    [
      "something went wrong",
      "error",
      "not working",
      "request failed",
      "failed",
      "system issue",
      "technical issue"
    ],
    [
      "Something went wrong.",
      "Please try again.",
      "Error occurred.",
      "Retry after a moment.",
      "System issue detected.",
      "Unable to process request.",
      "Try again later.",
      "Temporary issue.",
      "Request failed.",
      "Please refresh and retry.",
      "I detected a temporary issue, please retry in a few seconds."
    ],
    10
  ),
  intent(
    "confirmation_general",
    "confirmation",
    ["yes", "correct", "confirmed", "exactly", "you are right", "that's true", "indeed"],
    [
      "Yes, that's correct.",
      "Absolutely.",
      "Right.",
      "Correct.",
      "That's true.",
      "Yes.",
      "Confirmed.",
      "Exactly.",
      "You're right.",
      "Indeed.",
      "Great, we're aligned."
    ],
    9
  ),
  intent(
    "denial_general",
    "denial",
    ["no", "not correct", "incorrect", "not possible", "i disagree", "that wont work", "negative"],
    [
      "No, that's not correct.",
      "I don't think so.",
      "That's incorrect.",
      "Not possible.",
      "Sorry, no.",
      "That won't work.",
      "I disagree.",
      "That's not right.",
      "Negative.",
      "Unfortunately not.",
      "Let's try a different option."
    ],
    9
  ),
  intent(
    "instructions_general",
    "instructions",
    ["instructions", "steps", "guide me", "what should i do", "how to proceed", "procedure"],
    [
      "Follow the steps carefully.",
      "Enter valid details.",
      "Check before submitting.",
      "Complete all fields.",
      "Try again step-by-step.",
      "Make sure inputs are correct.",
      "Proceed carefully.",
      "Verify your data.",
      "Double-check everything.",
      "Follow instructions clearly.",
      "I'll guide you through each step if you share your exact issue."
    ],
    10
  ),
  intent(
    "unknown_general",
    "unknown",
    ["i didnt understand", "didn't understand", "unknown request", "unclear", "what do you mean", "rephrase"],
    [
      "I didn't understand that.",
      "Can you rephrase?",
      "Not sure about that.",
      "Try asking differently.",
      "I didn't get that.",
      "Could you clarify?",
      "Unknown request.",
      "Please explain more.",
      "That's unclear.",
      "Try again.",
      "Please share a little more context so I can help accurately."
    ],
    10
  ),
  intent(
    "smalltalk_general",
    "small_talk",
    ["how are you", "whats up", "what's up", "are you there", "how is it going", "sup"],
    [
      "I'm just a bot, but I'm doing great!",
      "Always ready to help.",
      "I don't have feelings, but I'm here!",
      "Just working as expected.",
      "Ready when you are.",
      "I'm functioning perfectly.",
      "Let's solve something!",
      "Ask me anything.",
      "I'm active and ready.",
      "All systems operational.",
      "Fully online and ready to assist you."
    ],
    9
  ),
  intent(
    "contact_support_general",
    "contact_support",
    ["customer care", "contact support", "talk to agent", "human support", "speak to representative"],
    [
      "Sure, I can connect you with support.",
      "Please share your issue and order ID for faster help.",
      "Customer support can help with account and order concerns.",
      "I can route this to a human support specialist.",
      "Please provide your phone or email linked to the order."
    ],
    9
  ),
  intent(
    "pricing_general",
    "pricing",
    ["price", "pricing", "cost", "how much", "cheapest", "expensive"],
    [
      "Pricing varies by product and pack size.",
      "Please check product page for the latest price.",
      "Combo packs often provide better value.",
      "You can use available offers at checkout for savings.",
      "Tell me the product name and I can guide you on pricing options."
    ],
    8
  ),
  intent(
    "account_general",
    "account",
    ["login issue", "cannot login", "sign in issue", "account help", "password reset", "signup issue"],
    [
      "I can help with account access issues.",
      "Try resetting your password from the login page.",
      "Please verify your email/phone and try again.",
      "If signup fails, refresh and retry after a moment.",
      "Share the exact account error and I'll guide the next steps."
    ],
    8
  ),
  intent(
    "payment_general",
    "payment",
    ["payment failed", "upi failed", "card declined", "payment issue", "transaction failed", "cod available"],
    [
      "Please retry the payment once after a short wait.",
      "If amount was deducted, share transaction details for support.",
      "Try another payment method if the issue persists.",
      "COD availability depends on location and cart value.",
      "I can help you with payment troubleshooting step by step."
    ],
    8
  ),
  intent(
    "returns_general",
    "returns",
    ["return", "refund", "replacement", "exchange", "cancel and refund", "return policy"],
    [
      "Returns and refunds follow the active policy window.",
      "Please share order ID and issue details for return support.",
      "Replacement is possible for eligible damaged or wrong items.",
      "Refund is processed after verification.",
      "I can guide you with the return process now."
    ],
    8
  ),
];

const unknownIntentResponses = [
  "I didn't understand that.",
  "Can you rephrase your question?",
  "I'm not sure about that.",
  "Try asking differently.",
  "Please clarify your request.",
  "That's unclear to me.",
  "Ask something related to products or orders.",
  "I'm still learning.",
  "Can you provide more details?",
  "Let's try again.",
  "I couldn't get that.",
  "Try a specific question.",
  "I'm here to help, please rephrase.",
  "Unknown request.",
  "Please explain more.",
  "I may have missed your intent, can you ask in another way?",
  "Share your question with a little more detail and I will help."
];

const guidedCommerceIntents: IntentDefinition[] = [
  intent(
    "guided_greeting",
    "greeting",
    ["hi", "hello", "hey", "good morning", "good evening"],
    [
      "Hello! How can I assist you today?",
      "Hi there! What can I help you with?",
      "Hey! Looking for product suggestions or order help?",
      "Welcome! How may I assist you?",
      "Hi! Ready to explore products?",
      "Hello! Ask me anything.",
      "Hey there! Need help choosing something?",
      "Hi! I'm your support assistant.",
      "Greetings! What do you need today?",
      "Hello! Let's get started.",
      "Hi! I can help with products, orders, and more.",
      "Hey! Need recommendations?",
      "Hello! How can I support you today?",
      "Hi! Looking for something specific?",
      "Hey! Tell me what you need.",
      "Namaste! I can help you choose the right product.",
      "Hi! Want me to suggest a best seller?"
    ],
    11
  ),
  intent(
    "guided_product_recommendation",
    "product_recommendation",
    [
      "suggest product",
      "recommend product",
      "what should i buy",
      "best product",
      "which product is best",
      "i want to buy a product",
      "suggest me a product",
      "which will be the best product",
      "buy product for me"
    ],
    [
      "I can help with that. What category are you interested in?",
      "Tell me your budget and I will suggest the best option.",
      "Looking for performance, budget, or premium?",
      "I recommend choosing based on your needs. What are you looking for?",
      "We have several great options. Want affordable or premium?",
      "Let me suggest something based on your usage.",
      "Do you prefer budget-friendly or high-end products?",
      "Tell me your requirements and I will recommend the best product.",
      "I can suggest top-rated products for you.",
      "What's your budget range?",
      "Need a value-for-money option or top performance?",
      "Let me guide you to the right product.",
      "Best depends on your needs. Tell me more.",
      "I can shortlist the best options for you.",
      "Want trending or most affordable products?",
      "For quick help, tell me: goal, budget, and flavor preference.",
      "If you want, I can suggest one best and one affordable option.",
      "I can recommend based on gym, running, hydration, or recovery goals."
    ],
    15
  ),
  intent(
    "guided_affordable_products",
    "affordable_products",
    [
      "cheap product",
      "affordable product",
      "budget product",
      "low price",
      "best under price",
      "which will be the affordable product",
      "best affordable product"
    ],
    [
      "We have several budget-friendly options available.",
      "Tell me your budget and I will suggest the best affordable product.",
      "You can find great products at low prices in our catalog.",
      "Affordable doesn't mean low quality. Want recommendations?",
      "I can suggest the best value-for-money products.",
      "Looking for something under a specific price?",
      "Budget products are available with good features.",
      "Let me show you the most affordable options.",
      "You can filter products by price range.",
      "Best budget picks are available. Need help choosing?",
      "Affordable products are popular choices.",
      "Let me recommend top low-cost items.",
      "You can get quality products within your budget.",
      "Want the cheapest or best value?",
      "Budget-friendly options are available now.",
      "Tell me your price cap and I will suggest 2-3 strong options.",
      "I can suggest starter packs if you want lowest-cost entry."
    ],
    16
  ),
  intent(
    "guided_premium_products",
    "premium_products",
    ["premium", "expensive product", "high quality", "best quality", "top quality product"],
    [
      "We offer premium products with top performance.",
      "High-quality products are available with advanced features.",
      "Premium options provide the best experience.",
      "Looking for top-tier products?",
      "Let me recommend high-end items.",
      "Premium products are built for performance.",
      "Top-rated products are available in premium range.",
      "You will get the best quality in this category.",
      "Want the best regardless of price?",
      "Premium items offer durability and performance.",
      "Luxury products are also available.",
      "Top performance products are listed here.",
      "High-end products deliver maximum value.",
      "Premium category includes best sellers.",
      "Let me guide you to the best quality products.",
      "If quality is your priority, I can shortlist top-rated premium picks.",
      "Share your goal and I will suggest the most effective premium option."
    ],
    15
  ),
  intent(
    "guided_product_comparison",
    "product_comparison",
    ["compare", "difference", "which is better", "vs", "compare products", "product vs product"],
    [
      "I can compare products for you. Which ones?",
      "Tell me the products you want to compare.",
      "Comparison helps you choose better. What are your options?",
      "Let me break down features for you.",
      "Which product are you deciding between?",
      "I will compare specs, price, and performance.",
      "Tell me both product names.",
      "I can highlight pros and cons.",
      "Comparison makes decisions easier.",
      "Let me help you pick the better option.",
      "I will show differences clearly.",
      "Want a quick comparison?",
      "Tell me your choices.",
      "I will suggest the best one for you.",
      "Let's compare them step by step.",
      "I can compare by budget, purpose, and ingredient profile.",
      "Share two names and I will give a clear winner for your use case."
    ],
    15
  ),
  intent(
    "guided_order_tracking",
    "order_tracking",
    ["track order", "where is my order", "order status", "track my shipment", "delivery update"],
    [
      "You can track your order using your order ID.",
      "Go to the tracking page for updates.",
      "Your order status is updated in real-time.",
      "Check your email for tracking details.",
      "Enter your order ID to track.",
      "Tracking is available 24/7.",
      "You will see delivery progress.",
      "Order updates are automatic.",
      "Track your order anytime.",
      "Shipping details are shared via email.",
      "Your order is on the way.",
      "Tracking ensures transparency.",
      "Stay updated with delivery info.",
      "Use your registered email.",
      "Let me help track your order.",
      "Share your order ID and I will guide you to the latest status.",
      "If tracking is not updating, I can help with support escalation."
    ],
    16
  ),
  intent(
    "guided_order_issue",
    "order_issue",
    ["problem", "issue", "wrong order", "not delivered", "order problem", "damaged order"],
    [
      "Sorry for the inconvenience. Let me help.",
      "Please share your order ID.",
      "We will resolve this quickly.",
      "Can you describe the issue?",
      "We are here to fix this.",
      "Your concern is important.",
      "We will investigate immediately.",
      "Let's solve this step by step.",
      "Support team will assist you.",
      "We apologize for the issue.",
      "We will update you soon.",
      "Thanks for reporting.",
      "We will make it right.",
      "Help is on the way.",
      "We appreciate your patience.",
      "Please share photos if item is damaged, that speeds up resolution.",
      "I can route this issue to support with priority details."
    ],
    14
  ),
  intent(
    "guided_payment",
    "payment",
    ["payment", "checkout", "transaction failed", "payment failed", "upi failed", "card declined"],
    [
      "We support secure payments.",
      "Try again if payment failed.",
      "Check your payment details.",
      "Use card or wallet options.",
      "Ensure sufficient balance.",
      "Payment confirmation is instant.",
      "Retry after a moment.",
      "Transactions are encrypted.",
      "We ensure safe checkout.",
      "Payment issues can be resolved.",
      "Contact support if needed.",
      "Secure payment gateway is used.",
      "Your payment is safe.",
      "All transactions are verified.",
      "Try another method if needed.",
      "If amount was deducted but order failed, share transaction ID for help.",
      "I can guide you through a quick payment troubleshooting checklist."
    ],
    15
  ),
  intent(
    "guided_refund",
    "returns",
    ["refund", "return", "cancel order", "refund status", "replacement", "exchange"],
    [
      "You can request a refund within the return period.",
      "Refunds are processed within a few days.",
      "Check return policy for details.",
      "You can cancel before shipping.",
      "Refund goes to original payment method.",
      "Return requests can be submitted online.",
      "We ensure smooth refunds.",
      "Track refund status easily.",
      "Refund after verification.",
      "Cancellation is simple.",
      "Refund process is transparent.",
      "Return shipping may apply.",
      "Refund confirmation via email.",
      "We handle returns efficiently.",
      "Let me help with refund steps.",
      "Share order ID and I can guide the fastest refund path.",
      "If return is approved, refund timelines depend on payment mode."
    ],
    15
  ),
  intent(
    "guided_unknown",
    "unknown",
    [],
    unknownIntentResponses,
    1
  ),
];

const baseBenefitIntents: IntentDefinition[] = [
  intent(
    "benefit_1",
    "benefits",
    ["product benefits"],
    "Fast&Up products boost hydration, energy, and performance.",
    8
  ),
  intent(
    "benefit_2",
    "benefits",
    ["why use fastandup", "why use fast and up"],
    "It helps you stay active, hydrated, and energized.",
    8
  ),
  intent(
    "benefit_3",
    "benefits",
    ["advantages"],
    "Faster absorption and better performance support.",
    7
  ),
  intent(
    "benefit_4",
    "benefits",
    ["what does it do"],
    "It supports energy, hydration, and recovery.",
    7
  ),
  intent(
    "benefit_5",
    "benefits",
    ["hydration benefits"],
    "Helps maintain fluid balance and prevent fatigue.",
    8
  ),
  intent("benefit_6", "benefits", ["energy boost"], "Provides quick energy during workouts.", 8),
  intent("benefit_7", "benefits", ["performance"], "Improves stamina and endurance.", 6),
  intent(
    "benefit_8",
    "benefits",
    ["fitness benefits"],
    "Supports workout performance and recovery.",
    8
  ),
  intent(
    "benefit_9",
    "benefits",
    ["daily use benefits"],
    "Keeps you active and refreshed daily.",
    8
  ),
  intent(
    "benefit_10",
    "benefits",
    ["electrolyte benefits"],
    "Replenishes lost salts and minerals.",
    8
  ),
];

const benefitTopics = [
  {
    suffix: "11",
    triggers: ["immunity benefits", "immunity support"],
    response: "Supports daily immunity and wellness.",
  },
  {
    suffix: "12",
    triggers: ["recovery benefits", "post workout recovery"],
    response: "Helps your body recover faster after workouts.",
  },
  {
    suffix: "13",
    triggers: ["stamina benefits", "stamina support"],
    response: "Improves stamina for longer activity.",
  },
  {
    suffix: "14",
    triggers: ["endurance benefits", "endurance support"],
    response: "Supports endurance during training.",
  },
  {
    suffix: "15",
    triggers: ["muscle recovery benefits", "muscle support benefits"],
    response: "Supports muscle recovery and strength.",
  },
  {
    suffix: "16",
    triggers: ["anti fatigue benefits", "fatigue support"],
    response: "Helps reduce workout fatigue.",
  },
  {
    suffix: "17",
    triggers: ["cramp prevention benefits", "avoid cramps"],
    response: "Supports electrolyte balance to reduce cramps.",
  },
  {
    suffix: "18",
    triggers: ["summer hydration benefits", "hot weather hydration"],
    response: "Keeps you hydrated in heat and active days.",
  },
  {
    suffix: "19",
    triggers: ["running benefits", "benefits for runners"],
    response: "Supports hydration and endurance for runners.",
  },
  {
    suffix: "20",
    triggers: ["gym benefits", "benefits for gym"],
    response: "Supports energy and recovery for gym sessions.",
  },
  {
    suffix: "21",
    triggers: ["sports benefits", "benefits for sports"],
    response: "Supports performance across sports activities.",
  },
  {
    suffix: "22",
    triggers: ["active lifestyle benefits", "lifestyle benefits"],
    response: "Keeps you refreshed and active through the day.",
  },
  {
    suffix: "23",
    triggers: ["focus benefits", "focus support"],
    response: "Supports focus and workout readiness.",
  },
  {
    suffix: "24",
    triggers: ["strength benefits", "strength support"],
    response: "Supports strength performance with better recovery.",
  },
  {
    suffix: "25",
    triggers: ["daily hydration support", "hydration support"],
    response: "Supports daily hydration and electrolyte balance.",
  },
  {
    suffix: "26",
    triggers: ["wellness benefits", "general wellness"],
    response: "Supports overall wellness and active living.",
  },
  {
    suffix: "27",
    triggers: ["long workout benefits", "long session support"],
    response: "Helps maintain energy during long sessions.",
  },
  {
    suffix: "28",
    triggers: ["travel hydration", "travel benefits"],
    response: "Supports hydration during travel and busy days.",
  },
  {
    suffix: "29",
    triggers: ["quick hydration", "instant hydration support"],
    response: "Provides fast hydration support when needed.",
  },
  {
    suffix: "30",
    triggers: ["all benefits", "overall benefits"],
    response: "Fast&Up supports hydration, energy, recovery, and endurance.",
  },
];

const extendedBenefitIntents: IntentDefinition[] = benefitTopics.map((topic) =>
  intent(
    `benefit_${topic.suffix}`,
    "benefits",
    topic.triggers,
    topic.response,
    7
  )
);

const baseUsageIntents: IntentDefinition[] = [
  intent(
    "usage_1",
    "usage",
    ["how to use"],
    "Drop one tablet in water, let it dissolve, and drink.",
    8
  ),
  intent(
    "usage_2",
    "usage",
    ["how to take"],
    "Mix in water and consume once dissolved.",
    8
  ),
  intent(
    "usage_3",
    "usage",
    ["directions"],
    "Add tablet to water and drink after dissolving.",
    8
  ),
  intent(
    "usage_4",
    "usage",
    ["when to take"],
    "Best before, during, or after workouts.",
    8
  ),
  intent("usage_5", "usage", ["daily usage"], "You can take it daily as per need.", 8),
  intent("usage_6", "usage", ["tablet use"], "Dissolve in water and drink.", 8),
  intent("usage_7", "usage", ["water quantity"], "Use one glass of water per tablet.", 8),
  intent(
    "usage_8",
    "usage",
    ["before workout"],
    "Yes, it helps boost energy before workouts.",
    8
  ),
  intent(
    "usage_9",
    "usage",
    ["after workout"],
    "Great for recovery after workouts.",
    8
  ),
  intent("usage_10", "usage", ["how many tablets"], "Usually 1-2 tablets per day.", 8),
];

const usageTopics = [
  ["usage_11", ["can i use twice a day", "two times usage"], "Use as per label guidance."],
  ["usage_12", ["empty stomach", "before food"], "You can use as directed, usually with water."],
  ["usage_13", ["after food", "with meal"], "Daily nutrition variants are usually fine after meals."],
  ["usage_14", ["night usage", "can i take at night"], "Use based on need and product type."],
  ["usage_15", ["morning usage", "take in morning"], "Morning use is fine for daily hydration support."],
  ["usage_16", ["during running", "use while running"], "Yes, it supports hydration during runs."],
  ["usage_17", ["during cycling", "use while cycling"], "Yes, it helps maintain endurance hydration."],
  ["usage_18", ["can kids use", "usage for kids"], "Use only age-appropriate variants with guidance."],
  ["usage_19", ["can women use", "usage for women"], "Yes, women can use suitable Fast&Up variants."],
  ["usage_20", ["can men use", "usage for men"], "Yes, men can use as per label instructions."],
  ["usage_21", ["how long to use", "usage duration"], "You can use regularly based on your activity needs."],
  ["usage_22", ["missed dose", "forgot to take"], "Take next planned serving. Do not double dose."],
  ["usage_23", ["can i mix with juice", "mix with drink"], "For best results, dissolve in plain water."],
  ["usage_24", ["can i swallow tablet", "swallow directly"], "No, dissolve fully in water before drinking."],
  ["usage_25", ["take with protein", "use with whey"], "Yes, you can use with your workout nutrition routine."],
  ["usage_26", ["use in summer", "summer usage"], "Yes, it is helpful for hydration in hot weather."],
  ["usage_27", ["use in winter", "winter usage"], "Yes, use based on hydration and activity needs."],
  ["usage_28", ["travel use", "carry while travel"], "Yes, it is convenient for hydration while traveling."],
  ["usage_29", ["workout timing", "best timing workout"], "Use before, during, or after workouts as needed."],
  ["usage_30", ["usage tips", "how to use properly"], "Use correct water quantity and follow label guidance."],
] as const;

const extendedUsageIntents: IntentDefinition[] = usageTopics.map((item) =>
  intent(item[0], "usage", [...item[1]], item[2], 7)
);

const baseIngredientIntents: IntentDefinition[] = [
  intent(
    "ingredient_1",
    "ingredients",
    ["ingredients"],
    "Contains electrolytes, vitamins, and essential nutrients.",
    8
  ),
  intent(
    "ingredient_2",
    "ingredients",
    ["what inside"],
    "Includes minerals and hydration salts.",
    8
  ),
  intent(
    "ingredient_3",
    "ingredients",
    ["vitamins"],
    "Rich in essential vitamins for energy.",
    8
  ),
  intent(
    "ingredient_4",
    "ingredients",
    ["electrolytes"],
    "Helps maintain hydration balance.",
    8
  ),
  intent(
    "ingredient_5",
    "ingredients",
    ["sugar content"],
    "Low sugar or sugar-free variants available.",
    8
  ),
];

const ingredientTopics = [
  ["ingredient_6", ["minerals"], "Contains important hydration minerals."],
  ["ingredient_7", ["contains caffeine"], "Some performance variants may include caffeine."],
  ["ingredient_8", ["contains zinc"], "Some wellness variants include zinc support."],
  ["ingredient_9", ["contains vitamin c"], "Some immunity variants include vitamin C."],
  ["ingredient_10", ["contains sodium"], "Electrolyte variants may include sodium support."],
  ["ingredient_11", ["contains potassium"], "Electrolyte variants may include potassium support."],
  ["ingredient_12", ["contains magnesium"], "Electrolyte variants may include magnesium support."],
  ["ingredient_13", ["artificial color"], "Please check pack label for additive details."],
  ["ingredient_14", ["preservatives"], "Please check product label for preservative details."],
  ["ingredient_15", ["gluten free"], "Please check label for gluten-related details."],
  ["ingredient_16", ["lactose free"], "Plant-based variants are generally dairy-free."],
  ["ingredient_17", ["vegan ingredients"], "Vegan variants are available in select products."],
  ["ingredient_18", ["allergen info"], "Please check label allergen information before use."],
  ["ingredient_19", ["protein content"], "Protein variants provide high-quality protein support."],
  ["ingredient_20", ["nutrition facts"], "Nutrition facts are available on each product pack."],
] as const;

const extendedIngredientIntents: IntentDefinition[] = ingredientTopics.map((item) =>
  intent(item[0], "ingredients", [...item[1]], item[2], 7)
);

const baseOrderIntents: IntentDefinition[] = [
  intent(
    "order_1",
    "orders",
    ["track order"],
    "Please share your order ID to track your order.",
    10
  ),
  intent(
    "order_2",
    "orders",
    ["order status"],
    "Share your order ID for status updates.",
    10
  ),
  intent(
    "order_3",
    "orders",
    ["where is my order"],
    "I can help track it. Please provide order ID.",
    10
  ),
  intent(
    "order_4",
    "orders",
    ["cancel order"],
    "Orders can be canceled before dispatch.",
    9
  ),
  intent("order_5", "orders", ["change order"], "Changes allowed before shipping.", 9),
  intent(
    "order_6",
    "orders",
    ["order delay"],
    "Delivery may take 3-5 working days.",
    9
  ),
  intent(
    "order_7",
    "orders",
    ["order confirmation"],
    "You'll receive confirmation via SMS/email.",
    9
  ),
  intent(
    "order_8",
    "orders",
    ["order not received"],
    "Please share order ID for help.",
    10
  ),
  intent(
    "order_9",
    "orders",
    ["track shipment"],
    "Tracking link will be shared after dispatch.",
    9
  ),
  intent(
    "order_10",
    "orders",
    ["delivery status"],
    "Check status using your order ID.",
    10
  ),
];

const orderTopics = [
  ["order_11", ["dispatch status"], "Please share order ID for dispatch updates."],
  ["order_12", ["payment failed"], "Please retry payment or check with your payment provider."],
  ["order_13", ["amount deducted"], "Please share transaction details for support."],
  ["order_14", ["invoice"], "Invoice can be shared after order confirmation."],
  ["order_15", ["cod order"], "COD is available in eligible locations."],
  ["order_16", ["change address"], "Address changes are possible before dispatch."],
  ["order_17", ["change phone"], "Phone updates are possible before dispatch."],
  ["order_18", ["multiple orders"], "Please share each order ID for tracking support."],
  ["order_19", ["order id missing"], "Please check SMS/email confirmation for order ID."],
  ["order_20", ["order issue"], "Please share order ID and issue details for quick help."],
  ["order_21", ["gift order"], "You can ship to another address during checkout."],
  ["order_22", ["partial order"], "Please share missing item details with order ID."],
  ["order_23", ["wrong order"], "Please share order ID for replacement support."],
  ["order_24", ["damaged order"], "Please report with photos within 48 hours."],
  ["order_25", ["cancel after shipping"], "Cancellation after shipping is usually not possible."],
  ["order_26", ["edit after shipping"], "Edits are usually not possible after shipping."],
  ["order_27", ["order pending"], "Please share order ID to check pending status."],
  ["order_28", ["order processing"], "Your order is under processing before dispatch."],
  ["order_29", ["resend confirmation"], "Please check spam or share details for support."],
  ["order_30", ["order support"], "Please share order ID for order-specific support."],
] as const;

const extendedOrderIntents: IntentDefinition[] = orderTopics.map((item) =>
  intent(item[0], "orders", [...item[1]], item[2], 8)
);

const baseOfferIntents: IntentDefinition[] = [
  intent("offer_1", "offers", ["offers"], "Check our website for latest offers.", 9),
  intent("offer_2", "offers", ["discount"], "We have regular discounts online.", 9),
  intent("offer_3", "offers", ["coupon"], "Apply coupon at checkout for savings.", 9),
  intent("offer_4", "offers", ["price"], "Prices vary by product. Visit website.", 8),
  intent("offer_5", "offers", ["cheap"], "We offer value packs for savings.", 8),
  intent("offer_6", "offers", ["combo"], "Combo packs available for better value.", 8),
  intent("offer_7", "offers", ["sale"], "Keep checking for seasonal sales.", 8),
  intent("offer_8", "offers", ["cashback"], "Cashback offers may be available.", 8),
  intent("offer_9", "offers", ["deal"], "Check deals section on website.", 8),
  intent("offer_10", "offers", ["best price"], "Online store gives best pricing.", 8),
];

const offerTopics = [
  ["offer_11", ["promo code"], "Apply promo code at checkout for savings."],
  ["offer_12", ["coupon code"], "Use valid coupon code before payment."],
  ["offer_13", ["offer today"], "Please check website banners for live offers."],
  ["offer_14", ["weekend offer"], "Weekend offers may be available online."],
  ["offer_15", ["festive offer"], "Festive offers are announced on website."],
  ["offer_16", ["new user offer"], "New user offers may be available online."],
  ["offer_17", ["bundle price"], "Bundles often provide better value pricing."],
  ["offer_18", ["bulk discount"], "Bulk purchases may have additional savings."],
  ["offer_19", ["subscription discount"], "Subscription savings may be available."],
  ["offer_20", ["minimum order offer"], "Some offers require minimum cart value."],
  ["offer_21", ["free gift"], "Free gifts may apply on selected campaigns."],
  ["offer_22", ["referral offer"], "Referral benefits may be available online."],
  ["offer_23", ["student discount"], "Please check latest eligibility offers online."],
  ["offer_24", ["first order discount"], "First-order discounts may be available."],
  ["offer_25", ["checkout offer"], "Checkout may show your eligible offers."],
  ["offer_26", ["app offer"], "App-specific offers may be available sometimes."],
  ["offer_27", ["payment offer"], "Payment partner offers may apply at checkout."],
  ["offer_28", ["limited deal"], "Limited-time deals are updated regularly."],
  ["offer_29", ["combo savings"], "Combo packs are great for better savings."],
  ["offer_30", ["offer details"], "Visit website for complete offer details."],
] as const;

const extendedOfferIntents: IntentDefinition[] = offerTopics.map((item) =>
  intent(item[0], "offers", [...item[1]], item[2], 8)
);

const baseDeliveryIntents: IntentDefinition[] = [
  intent(
    "delivery_1",
    "delivery",
    ["delivery time"],
    "Delivery takes 3-5 working days.",
    9
  ),
  intent("delivery_2", "delivery", ["shipping"], "We deliver across India.", 9),
  intent(
    "delivery_3",
    "delivery",
    ["return policy"],
    "Returns accepted as per policy.",
    9
  ),
  intent("delivery_4", "delivery", ["refund"], "Refund processed after approval.", 9),
  intent(
    "delivery_5",
    "delivery",
    ["damaged product"],
    "Please report within 48 hours.",
    9
  ),
  intent(
    "delivery_6",
    "delivery",
    ["late delivery"],
    "Delays may happen due to logistics.",
    8
  ),
  intent(
    "delivery_7",
    "delivery",
    ["shipping cost"],
    "Shipping may be free on offers.",
    8
  ),
  intent(
    "delivery_8",
    "delivery",
    ["replace product"],
    "Replacement available if eligible.",
    8
  ),
  intent(
    "delivery_9",
    "delivery",
    ["wrong product"],
    "We'll arrange replacement quickly.",
    9
  ),
  intent(
    "delivery_10",
    "delivery",
    ["return time"],
    "Returns allowed within policy period.",
    8
  ),
];

const deliveryTopics = [
  ["delivery_11", ["international shipping"], "Please check support for international availability."],
  ["delivery_12", ["pincode service"], "Please share your pincode for delivery availability."],
  ["delivery_13", ["same day delivery"], "Same-day delivery depends on location."],
  ["delivery_14", ["express shipping"], "Express shipping is available in selected areas."],
  ["delivery_15", ["weekend delivery"], "Weekend delivery depends on courier service."],
  ["delivery_16", ["missed delivery"], "Please contact courier for redelivery options."],
  ["delivery_17", ["delivery reschedule"], "Rescheduling depends on courier availability."],
  ["delivery_18", ["return pickup"], "Pickup is available where serviceable."],
  ["delivery_19", ["refund time"], "Refunds are processed after return verification."],
  ["delivery_20", ["refund source"], "Refund goes to original payment method."],
  ["delivery_21", ["shipment hold"], "Please contact support for shipment hold requests."],
  ["delivery_22", ["delivery address change"], "Address change is possible before dispatch."],
  ["delivery_23", ["replacement time"], "Replacement is processed as per policy timeline."],
  ["delivery_24", ["return charges"], "Return charges depend on policy and case type."],
  ["delivery_25", ["shipping partner"], "Courier partner is assigned after dispatch."],
  ["delivery_26", ["delivered but not received"], "Please report quickly with order details."],
  ["delivery_27", ["dispatch date"], "Dispatch timing depends on order confirmation."],
  ["delivery_28", ["delivery attempts"], "Courier may reattempt delivery based on policy."],
  ["delivery_29", ["shipping update"], "Please use tracking updates after dispatch."],
  ["delivery_30", ["delivery help"], "Share order ID for delivery-related support."],
] as const;

const extendedDeliveryIntents: IntentDefinition[] = deliveryTopics.map((item) =>
  intent(item[0], "delivery", [...item[1]], item[2], 8)
);

const baseFallbackIntents: IntentDefinition[] = [
  intent("fallback_1", "fallback", ["unknown"], "Sorry, I didn't understand. Please rephrase.", 5),
  intent(
    "fallback_2",
    "fallback",
    ["random"],
    "I can help with products, orders, or offers.",
    5
  ),
  intent("fallback_3", "fallback", ["nonsense"], "Please ask a valid question.", 5),
  intent(
    "fallback_4",
    "fallback",
    ["unclear"],
    "Could you please clarify your question?",
    5
  ),
  intent(
    "fallback_5",
    "fallback",
    ["???"],
    "I didn't get that. Try asking differently.",
    5
  ),
];

const fallbackTopics = [
  ["fallback_6", ["asdf", "qwerty"], "Please ask a valid Fast&Up question."],
  ["fallback_7", ["blah blah"], "Please ask about products, usage, orders, or offers."],
  ["fallback_8", ["dont know"], "Please ask clearly and I will help quickly."],
  ["fallback_9", ["no idea"], "Please rephrase and ask a specific question."],
  ["fallback_10", ["what"], "Please share your full question for better help."],
  ["fallback_11", ["hmm"], "Could you please clarify your question?"],
  ["fallback_12", ["ok"], "You can ask about products, usage, orders, or offers."],
  ["fallback_13", ["test"], "Please ask a valid Fast&Up query."],
  ["fallback_14", ["invalid"], "Please rephrase with product, order, or offer details."],
  ["fallback_15", ["nothing"], "Please ask your Fast&Up question and I will help."],
  ["fallback_16", ["skip"], "Please ask about products, usage, orders, or offers."],
  ["fallback_17", ["later"], "Sure. Ask anytime about products, usage, orders, or offers."],
  ["fallback_18", ["idk"], "Please rephrase your question in simple words."],
  ["fallback_19", ["??"], "I didn't get that. Please ask again clearly."],
  ["fallback_20", ["help topics"], "You can ask about products, usage, orders, or offers."],
] as const;

const extendedFallbackIntents: IntentDefinition[] = fallbackTopics.map((item) =>
  intent(item[0], "fallback", [...item[1]], item[2], 4)
);

const INTENTS: IntentDefinition[] = [
  ...greetingIntents,
  ...conversationalSupportIntents,
  ...guidedCommerceIntents,
  ...baseBenefitIntents,
  ...extendedBenefitIntents,
  ...baseUsageIntents,
  ...extendedUsageIntents,
  ...baseIngredientIntents,
  ...extendedIngredientIntents,
  ...baseOrderIntents,
  ...extendedOrderIntents,
  ...baseOfferIntents,
  ...extendedOfferIntents,
  ...baseDeliveryIntents,
  ...extendedDeliveryIntents,
  ...baseFallbackIntents,
  ...extendedFallbackIntents,
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/fast\s*&\s*up/g, "fastandup")
    .replace(/fast\s+and\s+up/g, "fastandup")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textToTokens(text: string) {
  return normalizeText(text).split(" ").filter(Boolean);
}

function withOptionsLine(answer: string) {
  return `${answer}\n${OPTIONS_LINE}`;
}

function isUnclearInput(message: string) {
  const normalized = normalizeText(message);
  if (!normalized) return true;

  const weakInputs = new Set(["h", "ha", "hmm", "umm", "ok", "yo"]);
  if (weakInputs.has(normalized)) return true;

  return normalized.length <= 1;
}

type ScoredIntent = {
  intent: IntentDefinition;
  score: number;
};

function getScoreByTrigger(message: string, trigger: string) {
  const normalizedMessage = normalizeText(message);
  const normalizedTrigger = normalizeText(trigger);

  if (!normalizedMessage || !normalizedTrigger) return 0;
  if (normalizedMessage === normalizedTrigger) return 120;

  const messageTokens = textToTokens(normalizedMessage);
  const triggerTokens = textToTokens(normalizedTrigger);
  if (triggerTokens.length === 0) return 0;

  if (triggerTokens.length === 1) {
    return messageTokens.includes(triggerTokens[0]) ? 100 : 0;
  }

  const compactMessage = normalizedMessage.replace(/\s+/g, "");
  const compactTrigger = normalizedTrigger.replace(/\s+/g, "");

  if (compactMessage === compactTrigger) return 115;
  if (normalizedMessage.includes(normalizedTrigger)) return 100;
  if (compactMessage.includes(compactTrigger)) return 95;

  const overlapCount = triggerTokens.filter((token) => messageTokens.includes(token)).length;
  const coverage = overlapCount / triggerTokens.length;

  if (
    messageTokens.length >= 2 &&
    messageTokens.every((token) => triggerTokens.includes(token))
  ) {
    return 72;
  }

  if (coverage === 1) return 92;
  if (coverage >= 0.75) return 85;
  if (coverage >= 0.6 && triggerTokens.length >= 2) return 78;
  if (coverage >= 0.5 && triggerTokens.length >= 3) return 70;

  return 0;
}

function findIntent(message: string): IntentDefinition | null {
  const candidates: ScoredIntent[] = [];

  for (const intentDef of INTENTS) {
    let bestTriggerScore = 0;

    for (const trigger of intentDef.triggers) {
      const score = getScoreByTrigger(message, trigger);
      if (score > bestTriggerScore) bestTriggerScore = score;
    }

    if (bestTriggerScore > 0) {
      candidates.push({
        intent: intentDef,
        score: bestTriggerScore + intentDef.priority,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].intent;
}

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickIntentResponse(intentDef: IntentDefinition, message: string) {
  if (intentDef.responses.length === 0) {
    return CLARIFY_MESSAGE;
  }

  if (intentDef.responses.length === 1) {
    return intentDef.responses[0];
  }

  const normalizedMessage = normalizeText(message);
  const seed = normalizedMessage || intentDef.id;
  const index = stableHash(`${intentDef.id}:${seed}`) % intentDef.responses.length;
  return intentDef.responses[index];
}

function pickUnknownFallbackResponse(message: string) {
  const normalizedMessage = normalizeText(message);
  const seed = normalizedMessage || "unknown";
  const index = stableHash(`unknown:${seed}`) % unknownIntentResponses.length;
  return unknownIntentResponses[index];
}

export function getRuleBasedReply(message: string): RuleAgentResult {
  const matchedIntent = findIntent(message);

  if (matchedIntent) {
    const response = pickIntentResponse(matchedIntent, message);
    return {
      mode: "matched",
      message: withOptionsLine(response),
      quickReplies: QUICK_REPLIES,
      matchedIntentId: matchedIntent.id,
    };
  }

  if (isUnclearInput(message)) {
    return {
      mode: "clarify",
      message: withOptionsLine(CLARIFY_MESSAGE),
      quickReplies: QUICK_REPLIES,
    };
  }

  return {
    mode: "fallback",
    message: withOptionsLine(pickUnknownFallbackResponse(message) ?? FALLBACK_MESSAGE),
    quickReplies: QUICK_REPLIES,
  };
}

export const RULE_BASE_SIZE = INTENTS.length;
