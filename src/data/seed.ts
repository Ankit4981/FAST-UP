import type { Order, Product } from "@/types";

export const seedProducts: Product[] = [
  {
    id: "prod_reload_electrolyte",
    slug: "reload-electrolyte",
    name: "Fast&Up Reload",
    price: 559,
    mrp: 699,
    description: "Hydration tablets with five essential electrolytes for training, travel and hot days.",
    longDescription:
      "An effervescent hydration blend built for runners, cyclists, gym-goers and everyday active people. It helps replenish sodium, potassium, magnesium, chloride and calcium without heavy sugar.",
    images: ["/products/reload-electrolyte.webp"],
    category: "Sports Nutrition",
    rating: 4.8,
    reviewCount: 4821,
    tags: ["hydration", "vegan", "electrolytes", "during-workout", "budget", "reload"],
    goalTags: ["hydration", "endurance", "cramps"],
    flavours: [
      { name: "Orange", color: "#FF6B35" },
      { name: "Lemon", color: "#FFD44D" },
      { name: "Watermelon", color: "#FF6B9D" },
      { name: "Lime", color: "#60C657" }
    ],
    badge: "Bestseller",
    nutrition: ["5 electrolytes", "Zero added sugar", "20 tablets", "Vitamin C"],
    howToUse: "Drop one tablet in 250 ml water, wait for the fizz to settle and drink during activity.",
    stock: 42,
    featured: true,
    imageAccent: "#1E90FF"
  },
  {
    id: "prod_reload_salts_orange_5s",
    slug: "reload-salts-orange-5s",
    name: "Fast&Up Reload Salts+ Orange (5 Sachets)",
    price: 162,
    mrp: 180,
    description:
      "High-sodium electrolyte mix for fast hydration and energy during heavy sweating sessions.",
    longDescription:
      "Reload Salts+ Orange is a zero sugar, zero calorie high-sodium hydration mix with sodium, potassium, magnesium, calcium and chloride. Designed for workouts, sports, travel and hot-weather hydration support.",
    images: ["/products/reload-salts-orange.webp"],
    category: "Sports Nutrition",
    rating: 4.7,
    reviewCount: 1240,
    tags: [
      "hydration",
      "electrolytes",
      "high sodium",
      "reload salts",
      "zero sugar",
      "during-workout"
    ],
    goalTags: ["hydration", "endurance", "recovery"],
    flavours: [{ name: "Orange Salts", color: "#F97316" }],
    badge: "High Sodium",
    nutrition: [
      "900 mg sodium",
      "200 mg potassium",
      "120 mg calcium",
      "Magnesium + chloride",
      "Zero sugar"
    ],
    howToUse: "Mix 1 sachet in 500 ml water and sip during or after activity.",
    stock: 86,
    featured: true,
    imageAccent: "#F97316"
  },
  {
    id: "prod_reload_salts_lemonade_5s",
    slug: "reload-salts-lemonade-5s",
    name: "Fast&Up Reload Salts+ Lemonade (5 Sachets)",
    price: 162,
    mrp: 180,
    description:
      "High-sodium lemonade electrolyte mix built for hydration support in intense or sweaty conditions.",
    longDescription:
      "Reload Salts+ Lemonade delivers essential electrolytes with a high-sodium profile for better fluid replenishment. It is a zero sugar, zero calorie hydration option when mixed in 500 ml water.",
    images: ["/products/reload-salts-lemonade.webp"],
    category: "Sports Nutrition",
    rating: 4.7,
    reviewCount: 1184,
    tags: [
      "hydration",
      "electrolytes",
      "high sodium",
      "reload salts",
      "zero sugar",
      "lemonade"
    ],
    goalTags: ["hydration", "endurance", "recovery"],
    flavours: [{ name: "Lemonade Salts", color: "#84CC16" }],
    badge: "Zero Sugar",
    nutrition: [
      "900 mg sodium",
      "200 mg potassium",
      "120 mg calcium",
      "Magnesium + chloride",
      "Zero calories"
    ],
    howToUse: "Mix 1 sachet in 500 ml water and consume during or after training.",
    stock: 74,
    featured: true,
    imageAccent: "#84CC16"
  },
  {
    id: "prod_whey_essentials_chocolate_800g",
    slug: "whey-essentials-chocolate-800g",
    name: "Fast&Up Whey Essentials Chocolate (800g)",
    price: 2479,
    mrp: 2599,
    description:
      "Premium whey isolate + concentrate blend for post-workout muscle recovery and daily protein intake.",
    longDescription:
      "Whey Essentials combines whey concentrate and whey isolate with digestive enzymes and probiotics. Each serving delivers 24g protein with BCAA and glutamine support for recovery-focused training routines.",
    images: ["/products/whey-essentials-chocolate.webp"],
    category: "Sports Nutrition",
    rating: 4.8,
    reviewCount: 1896,
    tags: ["whey", "protein", "muscle", "post-workout", "chocolate", "essentials"],
    goalTags: ["muscle gain", "recovery", "strength"],
    flavours: [{ name: "Rich Chocolate", color: "#5B3425" }],
    badge: "24g Protein",
    nutrition: ["24 g protein", "5.5 g BCAA", "4 g glutamine", "Enzymes + probiotics"],
    howToUse: "Add 1 heaping scoop in 300-350 ml water, shake well and consume post-workout.",
    stock: 41,
    featured: true,
    imageAccent: "#1D4ED8"
  },
  {
    id: "prod_whey_isolate_rich_chocolate_930g",
    slug: "whey-isolate-rich-chocolate-930g",
    name: "Fast&Up Whey Isolate Rich Chocolate (930g)",
    price: 4714,
    mrp: 5069,
    description:
      "100% whey isolate-focused protein formula with zero added sugar for lean muscle recovery.",
    longDescription:
      "Fast&Up Whey Isolate is designed for advanced performance nutrition. It delivers 26g protein per serving with BCAA and glutamine support, and includes Pepzyme Pro for improved protein utilization.",
    images: ["/products/whey-isolate-rich-chocolate.webp"],
    category: "Sports Nutrition",
    rating: 4.7,
    reviewCount: 430,
    tags: ["whey isolate", "protein", "muscle", "zero added sugar", "recovery", "chocolate"],
    goalTags: ["muscle gain", "recovery", "strength"],
    flavours: [{ name: "Rich Chocolate", color: "#6B3F2A" }],
    badge: "26g Protein",
    nutrition: ["26 g protein", "6 g BCAA", "4.5 g glutamine", "No amino spiking"],
    howToUse: "Mix 1 scoop with 250-300 ml water or milk and consume after training.",
    stock: 26,
    featured: true,
    imageAccent: "#EA580C"
  },
  {
    id: "prod_reload_orange_rush_500ml",
    slug: "reload-orange-rush-500ml",
    name: "Fast&Up Reload Orange Rush Drink (500ml)",
    price: 70,
    mrp: 75,
    description:
      "Ready-to-drink zero sugar electrolyte beverage with 5 vital electrolytes for quick refreshment.",
    longDescription:
      "Reload Orange Rush is a convenient hydration drink for on-the-go use. It contains 5 vital electrolytes, is caffeine-free, and helps support hydration during active days.",
    images: ["/products/reload-orange-rush-drink.webp"],
    category: "Energy Drinks",
    rating: 4.8,
    reviewCount: 980,
    tags: ["energy drink", "hydration", "electrolytes", "zero sugar", "orange rush", "ready to drink"],
    goalTags: ["hydration", "energy", "endurance"],
    flavours: [{ name: "Orange Rush", color: "#F97316" }],
    badge: "RTD",
    nutrition: ["5 vital electrolytes", "Zero sugar", "No caffeine", "500 ml bottle"],
    howToUse: "Chill and drink directly. Best used before, during, or after activity.",
    stock: 120,
    featured: true,
    imageAccent: "#2563EB"
  },
  {
    id: "prod_activate_preworkout",
    slug: "activate-pre-workout",
    name: "Activate Pre-Workout",
    price: 749,
    mrp: 899,
    description: "Clean energy, focus and endurance support before intense workouts.",
    longDescription:
      "A pre-workout formula designed for focused training sessions with caffeine, beta alanine and vitamins in a convenient effervescent format.",
    images: ["/products/activate-preworkout.webp"],
    category: "Pre-Workout",
    rating: 4.7,
    reviewCount: 3245,
    tags: ["energy", "vegan", "pre-workout", "focus", "gym"],
    goalTags: ["muscle gain", "strength", "energy"],
    flavours: [
      { name: "Orange", color: "#F26522" },
      { name: "Grape", color: "#7B2D8B" },
      { name: "Lemon", color: "#F5C84B" }
    ],
    badge: "Vegan",
    nutrition: ["Caffeine", "Beta alanine", "B vitamins", "No crash formula"],
    howToUse: "Drop one tablet in 250 ml chilled water 20 minutes before training.",
    stock: 36,
    featured: true,
    imageAccent: "#F26522"
  },
  {
    id: "prod_vitalize_multivitamin",
    slug: "vitalize-multivitamin",
    name: "Vitalize Multivitamin",
    price: 479,
    mrp: 599,
    description: "Daily effervescent multivitamin with essential vitamins and minerals.",
    longDescription:
      "A daily wellness tablet for busy routines, supporting immunity, energy metabolism and micronutrient intake with a refreshing citrus profile.",
    images: ["/products/vitalize-multivitamin.webp"],
    category: "Daily Nutrition",
    rating: 4.5,
    reviewCount: 2089,
    tags: ["immunity", "daily", "budget", "vitamins", "vegetarian"],
    goalTags: ["daily wellness", "immunity", "energy"],
    flavours: [
      { name: "Citrus", color: "#FFB703" },
      { name: "Lemon", color: "#FDE047" }
    ],
    badge: "New",
    nutrition: ["20 nutrients", "Vitamin D3", "Zinc", "B-complex"],
    howToUse: "Take one tablet daily in 250 ml water after breakfast.",
    stock: 58,
    featured: true,
    imageAccent: "#27AE60"
  },
  {
    id: "prod_recover_bcaa",
    slug: "recover-bcaa-glutamine",
    name: "Recover BCAA + Glutamine",
    price: 799,
    mrp: 999,
    description: "Post-workout recovery support with BCAA, glutamine and electrolytes.",
    longDescription:
      "Built for athletes who train repeatedly through the week. Supports muscle recovery, hydration and soreness management after high-output sessions.",
    images: ["/products/recover-bcaa.webp"],
    category: "Sports Nutrition",
    rating: 4.9,
    reviewCount: 5612,
    tags: ["recovery", "bcaa", "post-workout", "vegan", "muscle"],
    goalTags: ["muscle gain", "recovery", "strength"],
    flavours: [
      { name: "Orange", color: "#FF6B35" },
      { name: "Grape", color: "#DA70D6" },
      { name: "Blueberry", color: "#1E90FF" }
    ],
    badge: "Popular",
    nutrition: ["BCAA 2:1:1", "Glutamine", "Electrolytes", "Vitamin C"],
    howToUse: "Mix one scoop with 400 ml water and drink after training.",
    stock: 28,
    featured: true,
    imageAccent: "#7C3AED"
  },
  {
    id: "prod_plant_protein",
    slug: "plant-protein-performance",
    name: "Plant Protein Performance",
    price: 1499,
    mrp: 1899,
    description: "Complete vegan protein blend for lean muscle and daily recovery.",
    longDescription:
      "A plant-forward protein built with pea and brown rice protein, digestive enzymes and balanced amino acids for everyday performance nutrition.",
    images: ["/products/plant-protein.webp"],
    category: "Plant Power",
    rating: 4.6,
    reviewCount: 1744,
    tags: ["protein", "vegan", "muscle", "premium", "plant-based"],
    goalTags: ["muscle gain", "recovery", "vegan"],
    flavours: [
      { name: "Chocolate", color: "#6B3F2A" },
      { name: "Vanilla", color: "#F4E0B8" }
    ],
    badge: "Vegan",
    nutrition: ["24 g protein", "Pea + rice blend", "Digestive enzymes", "No dairy"],
    howToUse: "Shake one scoop with 250 ml water or milk after workout or between meals.",
    stock: 22,
    featured: true,
    imageAccent: "#169B62"
  },
  {
    id: "prod_whey_protein",
    slug: "fastup-whey-protein",
    name: "Fast&Up Whey Protein",
    price: 1699,
    mrp: 2099,
    description: "High-quality whey isolate blend for lean muscle gain and faster recovery.",
    longDescription:
      "A premium whey protein formula built for gym performance and daily muscle repair. Delivers complete amino support, fast absorption and low sugar to support strength-focused routines.",
    images: ["/products/plant-protein.webp"],
    category: "Sports Nutrition",
    rating: 4.7,
    reviewCount: 2648,
    tags: ["protein", "whey", "muscle", "recovery", "premium", "post-workout"],
    goalTags: ["muscle gain", "recovery", "strength"],
    flavours: [
      { name: "Chocolate", color: "#5C3A21" },
      { name: "Vanilla", color: "#E7D2A9" }
    ],
    badge: "Top Protein",
    nutrition: ["25 g protein", "Whey isolate blend", "Low sugar", "BCAA rich"],
    howToUse: "Mix one scoop in 250 ml chilled water after training or between meals.",
    stock: 34,
    featured: true,
    imageAccent: "#6B3F2A"
  },
  {
    id: "prod_vitamin_c",
    slug: "fastup-vitamin-c",
    name: "Fast&Up Vitamin C",
    price: 449,
    mrp: 599,
    description: "Daily vitamin C support with zinc for immunity and recovery resilience.",
    longDescription:
      "A daily effervescent immunity formula with vitamin C and zinc to support immune defence, collagen health and recovery from active stress.",
    images: ["/products/vitalize-multivitamin.webp"],
    category: "Daily Nutrition",
    rating: 4.6,
    reviewCount: 1976,
    tags: ["immunity", "vitamin c", "daily", "budget", "vegan", "zinc"],
    goalTags: ["immunity", "daily wellness", "energy"],
    flavours: [
      { name: "Orange", color: "#F97316" },
      { name: "Lemon", color: "#FACC15" }
    ],
    badge: "Immunity",
    nutrition: ["Vitamin C", "Zinc", "Antioxidants", "Effervescent absorption"],
    howToUse: "Take one tablet daily in 250 ml water after breakfast.",
    stock: 66,
    featured: true,
    imageAccent: "#F97316"
  },
  {
    id: "prod_collagen_glow",
    slug: "collagen-glow",
    name: "Collagen Glow",
    price: 899,
    mrp: 1099,
    description: "Beauty nutrition support for skin hydration, hair strength and glow.",
    longDescription:
      "A women's nutrition blend with collagen peptides, vitamin C, biotin and antioxidants to support skin, hair and nail wellness.",
    images: ["/products/collagen-glow.webp"],
    category: "Women's Nutrition",
    rating: 4.4,
    reviewCount: 1258,
    tags: ["beauty", "women", "collagen", "skin", "premium"],
    goalTags: ["skin glow", "hair care", "daily wellness"],
    flavours: [
      { name: "Berry", color: "#E84D8A" },
      { name: "Pomegranate", color: "#B91C1C" }
    ],
    badge: "Glow",
    nutrition: ["Collagen peptides", "Biotin", "Vitamin C", "Antioxidants"],
    howToUse: "Dissolve one tablet in 250 ml water once daily.",
    stock: 31,
    featured: false,
    imageAccent: "#E84D8A"
  },
  {
    id: "prod_kids_immunity",
    slug: "kidz-immunity-fizz",
    name: "Kidz Immunity Fizz",
    price: 399,
    mrp: 499,
    description: "Kid-friendly immunity support with vitamin C, zinc and playful flavours.",
    longDescription:
      "A gentle daily supplement designed for kids, with bright flavours and core nutrients that support immune health and active growth.",
    images: ["/products/kids-immunity.webp"],
    category: "Kidz Nutrition",
    rating: 4.3,
    reviewCount: 942,
    tags: ["kids", "immunity", "budget", "vitamins"],
    goalTags: ["immunity", "kids wellness", "daily wellness"],
    flavours: [
      { name: "Mango", color: "#FBBF24" },
      { name: "Strawberry", color: "#F43F5E" }
    ],
    badge: "Kidz",
    nutrition: ["Vitamin C", "Zinc", "D3", "Low sugar"],
    howToUse: "Use as directed on pack. Dissolve in water and serve with adult supervision.",
    stock: 44,
    featured: false,
    imageAccent: "#FBBF24"
  },
  {
    id: "prod_marathon_bundle",
    slug: "marathon-hydration-bundle",
    name: "Marathon Hydration Bundle",
    price: 1299,
    mrp: 1699,
    description: "Race-day bundle with hydration, energy and recovery essentials.",
    longDescription:
      "A high-value endurance stack for long runs and race weeks, combining pre-run energy, electrolyte reload and recovery nutrition.",
    images: ["/products/marathon-bundle.webp"],
    category: "Bundles",
    rating: 4.8,
    reviewCount: 2156,
    tags: ["bundle", "hydration", "endurance", "value", "running"],
    goalTags: ["hydration", "endurance", "recovery"],
    flavours: [
      { name: "Mixed", color: "#111111" },
      { name: "Orange", color: "#F26522" }
    ],
    badge: "Save 24%",
    nutrition: ["Reload", "Activate", "Recover", "Race guide"],
    howToUse: "Use Activate before, Reload during and Recover after endurance activity.",
    stock: 18,
    featured: true,
    imageAccent: "#111111"
  }
];

export const demoOrders: Order[] = [
  {
    id: "demo_order_1",
    orderNumber: "FU-DEMO24",
    userEmail: "demo@fastup.dev",
    address: {
      fullName: "Demo Athlete",
      phone: "9999999999",
      email: "demo@fastup.dev",
      line1: "42 Race Day Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    items: [
      {
        productId: "prod_reload_electrolyte",
        name: "Fast&Up Reload",
        slug: "reload-electrolyte",
        image: "/products/reload-electrolyte.webp",
        price: 559,
        quantity: 2
      }
    ],
    subtotal: 1118,
    shipping: 0,
    total: 1118,
    status: "shipped",
    paymentMode: "cod",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];
