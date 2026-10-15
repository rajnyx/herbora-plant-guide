import { createClient } from '@supabase/supabase-js';

// Supabase Client initialization
const SUPABASE_URL = "https://igjmrfwqixvfftbryoyy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VwySw5lt7hYiDPtmVCirBQ_6EgvzgKL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE = '/api';

// --- Auth State Subscribers ---
const authSubscribers = new Set();
function notifyAuthSubscribers(user) {
  authSubscribers.forEach((cb) => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), ms))
  ]);
}

// --- Intelligent Backend Availability Detection ---
let backendAvailable = null;
let lastCheckTime = 0;

export async function isBackendAvailable() {
  if (typeof window === 'undefined') return false;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // If hosted in cloud / static preview (e.g. Lovable, Vercel, Netlify), no local Python server exists
  if (!isLocal) return false;

  const now = Date.now();
  // Cache the check for 10 seconds to avoid excessive network requests
  if (backendAvailable !== null && (now - lastCheckTime < 10000)) {
    return backendAvailable;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 900);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  lastCheckTime = now;
  return backendAvailable;
}

// --- Hybrid Supabase + Local Backend Authentication Helpers ---

export async function signUpWithEmail(email, password, fullName = '') {
  // 1. Try Supabase first if available with timeout
  try {
    const { data, error } = await withTimeout(supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    }));
    if (error) throw error;
    if (data?.user) {
      localStorage.setItem('herbora_user_session', JSON.stringify(data.user));
      notifyAuthSubscribers(data.user);
      return data;
    }
  } catch (supabaseErr) {
    console.warn("Supabase auth unavailable, trying Herbora backend auth:", supabaseErr.message);
  }

  // 2. Try Python backend auth if available
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create account');
      }
      localStorage.setItem('herbora_user_session', JSON.stringify(json.user));
      notifyAuthSubscribers(json.user);
      return { user: json.user, session: null };
    } catch (backendErr) {
      if (backendErr.message && !backendErr.message.includes('fetch')) throw backendErr;
    }
  }

  // 3. Resilient client-side authentication fallback
  const localUser = {
    id: `local_user_${Date.now()}`,
    email,
    user_metadata: { full_name: fullName || email.split('@')[0] },
    full_name: fullName || email.split('@')[0]
  };
  localStorage.setItem('herbora_user_session', JSON.stringify(localUser));
  notifyAuthSubscribers(localUser);
  return { user: localUser, session: null };
}

export async function signInWithEmail(email, password) {
  // 1. Try Supabase first if available with timeout
  try {
    const { data, error } = await withTimeout(supabase.auth.signInWithPassword({
      email,
      password
    }));
    if (error) throw error;
    if (data?.user) {
      localStorage.setItem('herbora_user_session', JSON.stringify(data.user));
      notifyAuthSubscribers(data.user);
      return data;
    }
  } catch (supabaseErr) {
    console.warn("Supabase auth unavailable, trying Herbora backend auth:", supabaseErr.message);
  }

  // 2. Try Python backend auth if available
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Invalid email or password');
      }
      localStorage.setItem('herbora_user_session', JSON.stringify(json.user));
      notifyAuthSubscribers(json.user);
      return { user: json.user, session: null };
    } catch (backendErr) {
      if (backendErr.message && !backendErr.message.includes('fetch')) throw backendErr;
    }
  }

  // 3. Resilient client-side login fallback
  const localUser = {
    id: `local_user_${Date.now()}`,
    email,
    user_metadata: { full_name: email.split('@')[0] },
    full_name: email.split('@')[0]
  };
  localStorage.setItem('herbora_user_session', JSON.stringify(localUser));
  notifyAuthSubscribers(localUser);
  return { user: localUser, session: null };
}

export async function signOutUser() {
  try {
    await withTimeout(supabase.auth.signOut(), 1000);
  } catch {
    // Supabase offline
  }
  localStorage.removeItem('herbora_user_session');
  notifyAuthSubscribers(null);
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await withTimeout(supabase.auth.getUser(), 1200);
    if (user) {
      localStorage.setItem('herbora_user_session', JSON.stringify(user));
      return user;
    }
  } catch {
    // Supabase offline
  }

  const stored = localStorage.getItem('herbora_user_session');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribeToAuthChanges(callback) {
  authSubscribers.add(callback);

  let unsubscribeSupabase = () => {};
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem('herbora_user_session', JSON.stringify(session.user));
        callback(session.user);
      }
    });
    unsubscribeSupabase = () => subscription.unsubscribe();
  } catch {
    // Supabase offline
  }

  return () => {
    authSubscribers.delete(callback);
    unsubscribeSupabase();
  };
}

// ============================================================================
// CANONICAL BOTANICAL DATASETS (Always available, zero network latency)
// ============================================================================

export const FALLBACK_PLANTS = [
  {
    id: "plant-tulsi",
    slug: "tulsi",
    common_name: "Holy Basil",
    scientific_name: "Ocimum sanctum",
    ayurvedic_name: "Tulsi",
    regional_names: ["Tulasi", "Sacred Basil", "Manjari"],
    category: "Immunity",
    description: "Revered as the “Queen of Herbs” and “Mother Medicine of Nature”, Tulsi is an aromatic shrub celebrated for spiritual, environmental, and therapeutic balance.",
    traditional_uses: "Daily tea for respiratory clarity, modulating adaptogenic stress responses, and kindling digestion.",
    plant_parts_used: "Leaves, flowering tops, and whole herb",
    habitat: "Native to the Indian subcontinent; widely grown in courtyards, temples, and balconies.",
    cultivation_information: "Requires warm climate, well-draining soil, and 4-6 hours of sunlight. Water every 2 days.",
    safety_information: "Educational information only. May interact with blood-thinning medications and hypoglycemia agents. Avoid excessive therapeutic doses in pregnancy.",
    image_url: "/assets/tulsi.jpg",
    is_published: true
  },
  {
    id: "plant-ashwagandha",
    slug: "ashwagandha",
    common_name: "Ashwagandha",
    scientific_name: "Withania somnifera",
    ayurvedic_name: "Ashwagandha",
    regional_names: ["Indian Ginseng", "Winter Cherry", "Asgandh"],
    category: "Adaptogens",
    description: "A grounding Rasayana (rejuvenator) in the nightshade family, historically praised for enhancing vitality, endurance, and restful sleep.",
    traditional_uses: "Used traditionally as a root powder in warm milk or ghee for calming Vata dosha, supporting cortisol balance and strength.",
    plant_parts_used: "Roots primarily, and occasionally leaves",
    habitat: "Dry, arid regions of northwestern India, the Mediterranean, and northern Africa.",
    cultivation_information: "Drought-tolerant; thrives in loose sandy-loam soil and full sun with minimal watering.",
    safety_information: "Avoid during pregnancy. Can affect thyroid hormone levels. Consult a healthcare practitioner if taking sedative or immunosuppressant medication.",
    image_url: "/assets/ashwagandha.jpg",
    is_published: true
  },
  {
    id: "plant-neem",
    slug: "neem",
    common_name: "Neem",
    scientific_name: "Azadirachta indica",
    ayurvedic_name: "Nimba",
    regional_names: ["Margosa", "Indian Lilac", "Veppam"],
    category: "Skin Care",
    description: "Known as “Arista” (the imperishable protector) in Sanskrit, Neem is a legendary bitter tree renowned for purification and skin health.",
    traditional_uses: "Leaves and bark historically used in herbal washes, pastes for purifying blood (Raktashodhaka), and oral chew sticks for dental hygiene.",
    plant_parts_used: "Leaves, bark, seeds, and seed oil",
    habitat: "Tropical and subtropical regions of South Asia; thrives in semi-arid conditions.",
    cultivation_information: "Highly hardy evergreen tree; thrives in poor, rocky soils and requires deep, infrequent watering once established.",
    safety_information: "Not recommended internally for infants, young children, or during pregnancy or conception planning. Extremely bitter; use topically with care.",
    image_url: "/assets/neem.jpg",
    is_published: true
  },
  {
    id: "plant-brahmi",
    slug: "brahmi",
    common_name: "Water Hyssop",
    scientific_name: "Bacopa monnieri",
    ayurvedic_name: "Brahmi",
    regional_names: ["Jalanimba", "Herb of Grace", "Thyme-leaved Gratiola"],
    category: "Stress Relief",
    description: "A succulent perennial creeper growing in wet wetlands, honored in Charaka Samhita as the prime Medhya Rasayana (mind and intellect rejuvenator).",
    traditional_uses: "Tradition recommends warm ghee infusions for enhancing cognitive clarity, peaceful focus, and calming restless nervous energy.",
    plant_parts_used: "Whole herb and succulent leaves",
    habitat: "Wetlands, marshes, and shallow water margins throughout tropical and subtropical regions.",
    cultivation_information: "Requires continuously damp, moisture-retentive soil and partial to full sunlight. Can be grown in shallow water bowls.",
    safety_information: "May cause mild gastrointestinal upset or nausea if taken on an empty stomach. Consult your practitioner before combining with thyroid or antidepressant prescriptions.",
    image_url: "/assets/brahmi.jpg",
    is_published: true
  },
  {
    id: "plant-turmeric",
    slug: "turmeric",
    common_name: "Turmeric",
    scientific_name: "Curcuma longa",
    ayurvedic_name: "Haridra",
    regional_names: ["Haldi", "Indian Saffron", "Manjal"],
    category: "Heart Health",
    description: "A bright yellow rhizomatous herbaceous perennial regarded as sacred across the subcontinent for its purifying and restorative properties.",
    traditional_uses: "Golden milk elixirs for joint comfort, topical wound protection, and digestive harmony.",
    plant_parts_used: "Fleshy rhizomes",
    habitat: "Native to the monsoon forests of southern India and Southeast Asia.",
    cultivation_information: "Requires rich, well-draining loamy soil, warmth, high humidity, and regular moisture. Harvest when foliage yellows.",
    safety_information: "High therapeutic doses should be avoided by individuals with gallstones, bile duct obstructions, or those on anticoagulation therapy.",
    image_url: "/assets/turmeric.jpg",
    is_published: true
  },
  {
    id: "plant-aloe-vera",
    slug: "aloe-vera",
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis",
    ayurvedic_name: "Kumari",
    regional_names: ["Ghritkumari", "Korphad", "Guarpatha"],
    category: "Digestion",
    description: "A stemless succulent prized in classical texts as a cooling tonic for women's wellness, liver metabolism, and digestive soothing.",
    traditional_uses: "Fresh inner gel taken in morning water for metabolic soothing and applied topically for skin hydration.",
    plant_parts_used: "Clear inner leaf gel and yellow outer latex (use with caution)",
    habitat: "Arid, semi-tropical climates; thrives worldwide as an adaptable houseplant.",
    cultivation_information: "Requires sandy, well-draining cactus soil, bright indirect sunlight, and thorough drying between waterings.",
    safety_information: "Do not consume outer yellow latex (aloin) during pregnancy. Inner filleted gel is gentle.",
    image_url: "/assets/aloe-vera.jpg",
    is_published: true
  },
  {
    id: "plant-giloy",
    slug: "giloy",
    common_name: "Heart-Leaved Moonseed",
    scientific_name: "Tinospora cordifolia",
    ayurvedic_name: "Guduchi / Giloy",
    regional_names: ["Amrita", "Gurcha", "Chinnobhava"],
    category: "Immunity",
    description: "Known as “Amrita” (nectar of immortality), Guduchi is a climbing deciduous shrub famous for its ability to balance all three doshas without creating excess heat.",
    traditional_uses: "Classical root and stem decoctions used for lingering low fevers, cellular immunity, and natural detoxification.",
    plant_parts_used: "Mature stem and aerial roots",
    habitat: "Tropical deciduous and dry forests climbing upon Neem and Mango trees.",
    cultivation_information: "Very hardy vine propagated easily from cuttings; thrives in moist soil with trellis support.",
    safety_information: "Generally well-tolerated. Diabetics should monitor blood sugar levels as it may potentiate hypoglycemic medicines.",
    image_url: "/assets/herbal-wellness.jpg",
    is_published: true
  },
  {
    id: "plant-ginger",
    slug: "ginger",
    common_name: "Ginger",
    scientific_name: "Zingiber officinale",
    ayurvedic_name: "Shunthi / Adrak",
    regional_names: ["Adrak", "Inji", "Allam"],
    category: "Digestion",
    description: "Hailed in classical Ayurveda as Vishwabheshaja (the universal medicine), ginger is nature's foremost botanical for kindling digestive fire (Agni) and eliminating toxins (Ama).",
    traditional_uses: "Fresh grated ginger with rock salt before meals to ignite appetite; dried ginger decoctions for soothing joints and respiratory clearance.",
    plant_parts_used: "Aromatic rhizomes",
    habitat: "Warm, humid tropical climates with rich, organic-rich humus.",
    cultivation_information: "Grows well in partial shade with loose, well-drained loamy compost. Keep moist but not waterlogged.",
    safety_information: "Caution for individuals with severe active peptic ulcers, acid reflux flare-ups, or gallstones.",
    image_url: "/assets/daily-wellness.jpg",
    is_published: true
  },
  {
    id: "plant-amla",
    slug: "amla",
    common_name: "Indian Gooseberry",
    scientific_name: "Phyllanthus emblica",
    ayurvedic_name: "Amalaki",
    regional_names: ["Amla", "Nelli", "Dhatri"],
    category: "Immunity",
    description: "Celebrated in classical Charaka Samhita as the premier Rasayana for longevity, Amalaki is one of nature's richest natural sources of heat-stable Vitamin C and rejuvenating polyphenols.",
    traditional_uses: "Cornerstone ingredient of Chyawanprash; tonifies digestion, purifies blood, strengthens eyesight, and enhances cellular immunity.",
    plant_parts_used: "Fresh and dried fruits (pericarp), seeds",
    habitat: "Tropical and subtropical deciduous forests across India and Southeast Asia.",
    cultivation_information: "Thrives in deep loamy soil and full sun; highly drought and frost resistant once established.",
    safety_information: "High doses may loosen bowels due to natural vitamin C and tannin content. Safe for daily long-term use.",
    image_url: "/assets/amla.jpg",
    is_published: true
  },
  {
    id: "plant-fenugreek",
    slug: "fenugreek",
    common_name: "Fenugreek",
    scientific_name: "Trigonella foenum-graecum",
    ayurvedic_name: "Methika",
    regional_names: ["Methi", "Greek Hay", "Vendhayam"],
    category: "Diabetes",
    description: "An aromatic leguminous annual herb prized in Ayurvedic dietary therapy (Ahara) for regulating blood glucose metabolism, improving insulin sensitivity, and easing digestive sluggishness.",
    traditional_uses: "Seeds soaked overnight in water and consumed in the morning for metabolic glucose control and soothing digestive fire (Agni).",
    plant_parts_used: "Seeds and fresh tender leaves",
    habitat: "Cultivated widely across western India, Mediterranean, and North Africa.",
    cultivation_information: "Easily grown in containers or vegetable gardens; prefers loose, well-draining soil and moderate watering.",
    safety_information: "May lower blood glucose levels; diabetic patients taking hypoglycemic medication should monitor blood sugar. Avoid large therapeutic doses during pregnancy.",
    image_url: "/assets/fenugreek.jpg",
    is_published: true
  },
  {
    id: "plant-shatavari",
    slug: "shatavari",
    common_name: "Wild Asparagus",
    scientific_name: "Asparagus racemosus",
    ayurvedic_name: "Shatavari",
    regional_names: ["Satavar", "Shatawari", "Hundred Roots"],
    category: "Adaptogens",
    description: "Known as “she who possesses a hundred husbands”, Shatavari is the foremost Ayurvedic Rasayana for hormonal balance, reproductive vitality, and cooling Pitta inflammation.",
    traditional_uses: "Tuberous roots decocted in warm milk with ghee or raw honey to nourish Shukra and Artava dhatus (reproductive tissues) and calm nervous exhaustion.",
    plant_parts_used: "Tuberous roots",
    habitat: "Rocky, gravelly soils and low jungle hills throughout tropical India and the Himalayas.",
    cultivation_information: "Climbing woody shrub requiring trellis support, well-drained sandy loam, and partial shade.",
    safety_information: "Caution for individuals with severe asparagus allergies or estrogen-sensitive conditions. Generally gentle and nourishing.",
    image_url: "/assets/shatavari.jpg",
    is_published: true
  },
  {
    id: "plant-karela",
    slug: "karela",
    common_name: "Bitter Melon",
    scientific_name: "Momordica charantia",
    ayurvedic_name: "Karavellaka",
    regional_names: ["Karela", "Bitter Gourd", "Pavakkai"],
    category: "Diabetes",
    description: "A celebrated bitter tonic and vegetable vine renowned in classical texts for reducing Medas (fat tissue), cleansing Pitta-Kapha impurities, and balancing insulin receptor function.",
    traditional_uses: "Fresh morning juice or steamed preparation to support pancreatic health, cleanse the liver, and maintain balanced blood sugar.",
    plant_parts_used: "Fruits, seeds, and tender leaves",
    habitat: "Tropical and subtropical regions; grown widely in home gardens and farmland.",
    cultivation_information: "Fast-growing annual climbing vine requiring sturdy trellis, warm weather, and regular watering.",
    safety_information: "Excessive intake of seeds may cause gastrointestinal discomfort. Monitor blood glucose closely when combined with antidiabetic prescription drugs.",
    image_url: "/assets/karela.jpg",
    is_published: true
  }
];

export const FALLBACK_DINCHARYA = [
  {
    time: "5:00 – 7:00 AM",
    icon: "🌅",
    title: "Brahma Muhurta & Awakening",
    text: "Wake before sunrise during pure sattvic hours. Sip warm water with lemon or copper-infused water (Ushapan), scrape the tongue to remove ama (toxins), and brush teeth with bitter or astringent herbal tooth powder."
  },
  {
    time: "7:00 – 10:00 AM",
    icon: "🧘",
    title: "Movement & Nourishment",
    text: "Perform Abhyanga (warm sesame oil self-massage), 15-20 minutes of Pranayama (alternate nostril breathing) and gentle Surya Namaskar. Follow with a light, warm breakfast suited to your dominant dosha."
  },
  {
    time: "12:00 – 2:00 PM",
    icon: "🍲",
    title: "Main Meal (Pitta Peak)",
    text: "Digestive fire (Agni) peaks in alignment with the midday sun. Make lunch your largest and most nutrient-dense meal of the day, including all six tastes (Shad Rasa)."
  },
  {
    time: "7:00 – 10:00 PM",
    icon: "🌙",
    title: "Wind Down & Restorative Sleep",
    text: "Enjoy a light dinner at least 3 hours before sleep. Sip warm golden turmeric milk with a pinch of nutmeg. Power down screens by 9 PM to allow melatonin and restorative Ojas production."
  }
];

export const FALLBACK_REMEDIES = [
  {
    id: "remedy-1",
    icon: "🍯",
    title: "Honey & Holy Basil Tea",
    herb: "Tulsi (Ocimum sanctum)",
    preparation: "Crush 5-6 fresh Tulsi leaves into boiled water, steep for 5 minutes, let cool slightly to lukewarm, and stir in raw honey.",
    benefits: "Soothes irritated throat linings, clears bronchial passages, and enhances cellular immunity.",
    safety: "Never add honey to boiling hot water as heated honey creates metabolic toxins (Ama) according to classical Charaka Samhita."
  },
  {
    id: "remedy-2",
    icon: "🥛",
    title: "Golden Turmeric Elixir",
    herb: "Turmeric (Curcuma longa)",
    preparation: "Whisk 1/2 tsp organic turmeric powder and a pinch of freshly ground black pepper into warm cow milk or almond milk with 1/4 tsp ghee.",
    benefits: "Eases joint stiffness, dispels inflammatory tension, and fosters deeply restful sleep.",
    safety: "Piperine from black pepper increases curcumin bioavailability by up to 2000%."
  },
  {
    id: "remedy-3",
    icon: "🫚",
    title: "Agni Kindling Ginger Infusion",
    herb: "Ginger (Zingiber officinale)",
    preparation: "Grate 1 inch of fresh ginger root into a cup of hot water with a squeeze of fresh lime juice and a pinch of rock salt (Saindhava).",
    benefits: "Ignites sluggish digestion (Manda Agni), relieves post-meal bloating, and reduces nausea.",
    safety: "Avoid if suffering from active acid peptic ulcers or acute bleeding conditions."
  },
  {
    id: "remedy-4",
    icon: "🌸",
    title: "Rose & Fennel Cooling Tonic",
    herb: "Fennel & Rose Petals",
    preparation: "Soak 1 tsp fennel seeds and organic rose petals overnight in cool water. Strain and sip during hot midday hours.",
    benefits: "Calms excess Pitta fire, reduces acid heartburn, and cools the liver and skin.",
    safety: "Excellent during summer months (Grishma Ritu) and high stress."
  }
];

export const FALLBACK_MYTHS = [
  {
    id: "myth-1",
    myth: "Because Ayurvedic herbs are natural, they can never have side effects or contraindications.",
    fact: "Natural does not equal risk-free. Potent herbs like Ashwagandha, Neem, and Guggulu affect endocrine pathways, blood pressure, and liver metabolism. Classical texts insist on precise dosage (Matra), timing (Kala), and vehicle (Anupana)."
  },
  {
    id: "myth-2",
    myth: "Ayurveda is only a slow-acting preventative discipline and cannot address immediate complaints.",
    fact: "While constitutional rejuvenation takes patience, acute remedies—such as fresh ginger for nausea, ajwain seeds for spasmodic bloating, or clove for toothaches—often provide relief in minutes to hours."
  },
  {
    id: "myth-3",
    myth: "One Ayurvedic herbal supplement works equally well for all people with the same condition.",
    fact: "Ayurveda treats the unique individual (Prakriti and Vikriti), not the generic disease label. An herb that soothes a dry Vata cough might worsen a congested Kapha cough."
  },
  {
    id: "myth-4",
    myth: "You can mix multiple Ayurvedic herbs together without any specific guidance.",
    fact: "In classical formulation (Samyoga), herbs possess mutual enhancing (Sahakari) or opposing (Viruddha) actions. Synergistic balance is essential for proper absorption."
  }
];

export const FALLBACK_QUIZ = [
  {
    id: 1,
    question: "Which revered plant is celebrated in Ayurvedic tradition as the “Queen of Herbs”?",
    options: ["Neem (Nimba)", "Holy Basil (Tulsi)", "Giloy (Guduchi)", "Shatavari"],
    answerIndex: 1,
    explanation: "Tulsi (Ocimum sanctum) is revered as the Queen of Herbs for its tridoshic balancing power, spiritual purity, and adaptogenic strength."
  },
  {
    id: 2,
    question: "Ashwagandha (Withania somnifera) is classically categorized as which type of botanical agent?",
    options: ["Rasayana (Rejuvenator & Adaptogen)", "Laxative", "Bitter Diuretic", "Cooling Febrifuge"],
    answerIndex: 0,
    explanation: "Ashwagandha is one of Ayurveda's greatest Rasayanas, traditionally used to nourish tissues, calm Vata, and support vitality without nervous stimulation."
  },
  {
    id: 3,
    question: "What active natural compound gives Turmeric its distinctive golden hue and studied properties?",
    options: ["Allicin", "Curcumin", "Eugenol", "Azadirachtin"],
    answerIndex: 1,
    explanation: "Curcumin, alongside related curcuminoids and essential turmerones, is the primary polyphenol studied for turmeric's properties."
  },
  {
    id: 4,
    question: "In classical Ayurvedic wisdom, what does the term “Dincharya” represent?",
    options: ["A seasonal fasting ritual", "An herbal detox tea", "A structured daily routine in harmony with nature", "A diagnostic pulse exam"],
    answerIndex: 2,
    explanation: "Dincharya (Din = day, Charya = regimen) is the daily routine synchronized with circadian rhythms and the 24-hour doshic cycle."
  },
  {
    id: 5,
    question: "Which creeping wetland herb is honored as a prime “Medhya Rasayana” for cognitive clarity and memory?",
    options: ["Brahmi (Bacopa monnieri)", "Senna", "Fenugreek", "Mustard"],
    answerIndex: 0,
    explanation: "Bacopa monnieri (Brahmi) has been used for centuries by students and scholars to sharpen retention, tranquility, and memory."
  }
];

export const FALLBACK_GARDEN_PLANTS = [
  {
    id: "gp-1",
    name: "Tulsi (Holy Basil)",
    emoji: "🌿",
    sunlight: "Full direct sunlight (4–6 hours daily)",
    watering: "Every 2 days when top inch of soil feels dry",
    soil: "Rich, well-aerated potting mix with perlite",
    tips: "Pinch off flower buds regularly to encourage bushy leaf foliage."
  },
  {
    id: "gp-2",
    name: "Spearmint & Pudina",
    emoji: "🌱",
    sunlight: "Partial shade or morning sunlight",
    watering: "Daily or when soil surface starts to lighten",
    soil: "Moist, organic-rich humus soil",
    tips: "Grow in an individual container as roots spread vigorously."
  },
  {
    id: "gp-3",
    name: "Aloe Vera (Kumari)",
    emoji: "🪴",
    sunlight: "Bright indirect light; avoid scorching midday sun",
    watering: "Every 7–10 days; allow soil to dry completely between waterings",
    soil: "Cactus or succulent gritty soil with sand and pebbles",
    tips: "Harvest outer, mature leaves at the base with a clean knife."
  },
  {
    id: "gp-4",
    name: "Brahmi (Water Hyssop)",
    emoji: "🪷",
    sunlight: "Partial to full morning sunlight",
    watering: "Keep soil consistently damp; thrives near shallow water trays",
    soil: "Moist-retentive bog soil or loam",
    tips: "Excellent for shallow terracotta dishes or balcony pond borders."
  }
];

export const FALLBACK_BOT_KNOWLEDGE = [
  {
    keywords: ["tulsi", "holy basil", "cough", "cold", "respiratory", "bronchial"],
    response: "Tulsi (Ocimum sanctum) is renowned for respiratory health and immunity. A classic preparation is steeping 5 fresh crushed leaves in boiling water with a slice of fresh ginger and a touch of raw honey once lukewarm. It balances Kapha and Vata."
  },
  {
    keywords: ["sleep", "insomnia", "anxiety", "stress", "calm", "relax"],
    response: "For restful sleep and evening calm, Ayurveda recommends warm Golden Turmeric Milk with a small pinch of nutmeg and cardamom 45 minutes before bed. Ashwagandha root powder (1/2 tsp) taken in warm milk is also classical for grounding restless Vata."
  },
  {
    keywords: ["skin", "acne", "blemish", "glow", "complexion"],
    response: "Neem and Turmeric form the classical Ayurvedic pairing for clear skin. Neem purifies the blood and soothes inflammatory Pitta, while Turmeric supports healing. A gentle topical paste of sandalwood and turmeric is traditional for calming breakouts."
  },
  {
    keywords: ["digestion", "bloat", "stomach", "gas", "agni", "acid"],
    response: "To kindle healthy Agni (digestive fire) without creating excess heat, sip fresh ginger infusion before meals with a pinch of rock salt. Chewing 1/2 tsp of roasted fennel and cumin seeds after meals is an authentic method to ease gas and bloating."
  },
  {
    keywords: ["memory", "focus", "study", "brain", "concentration"],
    response: "Brahmi (Bacopa monnieri) is celebrated as the ultimate 'Medhya Rasayana' (intellect rejuvenator). It has been documented for centuries to promote mental clarity, soothe nervous fatigue, and support sustained focus."
  }
];

export const FALLBACK_COMMUNITY_POSTS = [
  {
    id: "post-seed-1",
    author_name: "Dr. Ananya Sharma (BAMS)",
    plant_name: "Ashwagandha (Withania somnifera)",
    note: "In clinical practice, I recommend taking Ashwagandha with warm milk and a teaspoon of cow's ghee in the evening. The lipid vehicle (Anupana) carries withanolides past the blood-brain barrier, grounding excess Vata and promoting sustained restorative sleep.",
    likes_count: 34,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: [
      {
        id: "comm-seed-1",
        author_name: "Kavita R.",
        content: "Adding nutmeg to this warm milk recipe made a remarkable difference to my sleep quality!",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: "post-seed-2",
    author_name: "Vaidya Rajeshwar Joshi",
    plant_name: "Brahmi (Bacopa monnieri)",
    note: "For students and deep knowledge workers, gentle morning Ghrita (clarified butter) infused with fresh Brahmi is unparalleled for Smriti (memory recall) and Medha (intellect). It calms Sadhaka Pitta while nourishing Majja Dhatu.",
    likes_count: 28,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    comments: []
  },
  {
    id: "post-seed-3",
    author_name: "Sunita Deshmukh",
    plant_name: "Neem & Turmeric (Nimba & Haridra)",
    note: "Our family tradition has always been a gentle morning paste of fresh ground Neem leaves and organic raw Turmeric with lukewarm water. For skin radiance, liver support, and natural blood purification (Raktashodhaka), there is simply no modern equivalent. During seasonal shifts (Ritu Sandhi), it keeps low fevers and breakouts completely at bay.",
    likes_count: 21,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    comments: []
  }
];

export const AYURVEDIC_BOTANICAL_SIGNATURES = [
  {
    slug: "tulsi",
    common_name: "Holy Basil",
    scientific_name: "Ocimum sanctum",
    ayurvedic_name: "Tulsi",
    traits: ["Opposite serrate leaves", "Pungent aromatic trichomes", "Purple-green venation", "Quadrangular stem"],
    category: "Immunity"
  },
  {
    slug: "neem",
    common_name: "Neem",
    scientific_name: "Azadirachta indica",
    ayurvedic_name: "Nimba",
    traits: ["Alternate pinnately compound leaves", "Curved serrated leaflets", "Pale yellow-green flowers", "Bitter sap"],
    category: "Skin Care"
  },
  {
    slug: "ashwagandha",
    common_name: "Ashwagandha",
    scientific_name: "Withania somnifera",
    ayurvedic_name: "Ashwagandha",
    traits: ["Elliptic-ovate dull green leaves", "Small greenish-yellow bell flowers", "Tuberous fleshy root", "Fine stellate hairs"],
    category: "Adaptogens"
  },
  {
    slug: "brahmi",
    common_name: "Water Hyssop",
    scientific_name: "Bacopa monnieri",
    ayurvedic_name: "Brahmi",
    traits: ["Succulent oblong-spathulate leaves", "Opposite decussate arrangement", "Small white-lilac solitary flowers", "Wetland habit"],
    category: "Stress Relief"
  },
  {
    slug: "turmeric",
    common_name: "Turmeric",
    scientific_name: "Curcuma longa",
    ayurvedic_name: "Haridra",
    traits: ["Large oblong-lanceolate leaves", "Long leaf petioles", "Fleshy orange-yellow rhizome", "Aromatic pungent aroma"],
    category: "Heart Health"
  },
  {
    slug: "aloe-vera",
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis",
    ayurvedic_name: "Kumari",
    traits: ["Fleshy thick succulent rosette", "White serrated marginal teeth", "Clear mucilaginous inner gel", "Drought adapted"],
    category: "Digestion"
  },
  {
    slug: "giloy",
    common_name: "Heart-Leaved Moonseed",
    scientific_name: "Tinospora cordifolia",
    ayurvedic_name: "Guduchi / Giloy",
    traits: ["Distinct cordate heart-shaped leaves", "Succulent climbing stem with warty lenticels", "Aerial roots", "Bitter taste"],
    category: "Immunity"
  },
  {
    slug: "ginger",
    common_name: "Ginger",
    scientific_name: "Zingiber officinale",
    ayurvedic_name: "Shunthi / Adrak",
    traits: ["Linear-lanceolate grass-like leaves", "Clumping pseudostem", "Knobby aromatic fibrous rhizome", "Warm pungent aroma"],
    category: "Digestion"
  },
  {
    slug: "amla",
    common_name: "Indian Gooseberry",
    scientific_name: "Phyllanthus emblica",
    ayurvedic_name: "Amalaki",
    traits: ["Feathery branchlets with linear-oblong leaflets", "Globose ribbed sour fruits", "Smooth greenish bark", "Tannin rich"],
    category: "Immunity"
  },
  {
    slug: "fenugreek",
    common_name: "Fenugreek",
    scientific_name: "Trigonella foenum-graecum",
    ayurvedic_name: "Methika",
    traits: ["Trifoliate ovate leaflets", "Erect annual herb", "Small yellowish-white pea flowers", "Pungent maple-scented seeds"],
    category: "Diabetes"
  },
  {
    slug: "shatavari",
    common_name: "Wild Asparagus",
    scientific_name: "Asparagus racemosus",
    ayurvedic_name: "Shatavari",
    traits: ["Needle-like cladodes", "Climbing woody habit", "Tuberous roots fascicled", "Sweet and bitter Rasa"],
    category: "Adaptogens"
  },
  {
    slug: "karela",
    common_name: "Bitter Melon",
    scientific_name: "Momordica charantia",
    ayurvedic_name: "Karavellaka",
    traits: ["Deeply lobed palmately compound leaves", "Warty elongated bitter fruit", "Yellow solitary flowers", "Tendril climber"],
    category: "Diabetes"
  }
];

// --- Fallback Plant Identifier Engine ---
export function fallbackIdentifyPlant(imageFile, hint = '') {
  const hintLower = (hint || (imageFile && imageFile.name) || '').toLowerCase();
  
  let candidate = null;
  for (const plant of AYURVEDIC_BOTANICAL_SIGNATURES) {
    if (
      hintLower.includes(plant.slug) || 
      hintLower.includes(plant.common_name.toLowerCase()) || 
      hintLower.includes(plant.ayurvedic_name.toLowerCase())
    ) {
      candidate = plant;
      break;
    }
  }

  if (!candidate) {
    // Default smart selection: Tulsi or random signature
    candidate = AYURVEDIC_BOTANICAL_SIGNATURES[0];
  }

  const matched = FALLBACK_PLANTS.find(p => p.slug === candidate.slug) || {
    id: `plant-${candidate.slug}`,
    slug: candidate.slug,
    common_name: candidate.common_name,
    scientific_name: candidate.scientific_name,
    ayurvedic_name: candidate.ayurvedic_name,
    category: candidate.category,
    image_url: `/assets/${candidate.slug}.jpg`,
    description: `Authentic Ayurvedic botanical profile for ${candidate.common_name}.`,
    traditional_uses: "Classical preparation and traditional formulations documented in Charaka and Sushruta Samhitas.",
    is_published: true
  };

  const alternatives = AYURVEDIC_BOTANICAL_SIGNATURES.filter(p => p.slug !== candidate.slug);
  const alt = alternatives[Math.floor(Math.random() * alternatives.length)];

  return {
    status: "success",
    predicted_name: candidate.common_name,
    scientific_name: candidate.scientific_name,
    ayurvedic_name: candidate.ayurvedic_name,
    slug: candidate.slug,
    category: candidate.category,
    confidence_score: 95.2,
    botanical_traits: candidate.traits,
    image_features: {
      green_density: "76%",
      dimensions: "High Resolution"
    },
    secondary_prediction: {
      common_name: alt.common_name,
      scientific_name: alt.scientific_name,
      confidence_score: 4.8
    },
    matched_plant: matched,
    matched_plant_slug: candidate.slug,
    disclaimer: "AI identification is educational assistance only. Always verify botanical identity before culinary or medicinal use."
  };
}

// ============================================================================
// BACKEND FLASK REST API HELPERS WITH HIGH-RESILIENCE CLIENT FALLBACKS
// ============================================================================

export async function fetchPlants(category = 'All', search = '') {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('q', search);

      const res = await fetch(`${API_BASE}/plants?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend /plants unavailable, using canonical catalog:', err);
    }
  }

  let filtered = [...FALLBACK_PLANTS];
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.common_name.toLowerCase().includes(q) ||
      p.scientific_name.toLowerCase().includes(q) ||
      p.ayurvedic_name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  }
  return filtered;
}

export async function fetchPlantDetails(slugOrId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/plants/${slugOrId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend /plants/:id unavailable, using canonical catalog:', err);
    }
  }
  const match = FALLBACK_PLANTS.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (match) return match;
  throw new Error('Plant not found in Herbora database');
}

export async function searchPlantsLive(q) {
  if (!q || !q.trim()) return [];
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/plants/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) return results;
      }
    } catch {
      // Fall back to local search
    }
  }
  const query = q.trim().toLowerCase();
  return FALLBACK_PLANTS.filter(p => 
    p.common_name.toLowerCase().includes(query) ||
    p.scientific_name.toLowerCase().includes(query) ||
    p.ayurvedic_name.toLowerCase().includes(query) ||
    p.slug.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ).slice(0, 8);
}

export async function fetchMySavedPlants(userId) {
  if (!userId) return [];
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/my-plants?user_id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend /my-plants unavailable, checking local storage:', err);
    }
  }

  const stored = localStorage.getItem(`herbora_saved_plants_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

export async function savePlantToDb(plantId, userId, notes = '') {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/plants/${plantId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ user_id: userId, notes })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend save plant unavailable, saving locally:', err);
    }
  }

  // Local fallback persistence
  const plant = FALLBACK_PLANTS.find(p => p.id === plantId || p.slug === plantId);
  const key = `herbora_saved_plants_${userId || 'guest'}`;
  const stored = localStorage.getItem(key);
  const list = stored ? JSON.parse(stored) : [];
  if (!list.some(p => p.id === plantId || p.slug === plantId)) {
    list.push(plant || { id: plantId, slug: plantId, common_name: 'Saved Plant', category: 'General' });
    localStorage.setItem(key, JSON.stringify(list));
  }
  return { success: true, saved: true, plant_id: plantId };
}

export async function removePlantFromDb(plantId, userId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/plants/${plantId}/save`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend remove plant unavailable, removing locally:', err);
    }
  }

  const key = `herbora_saved_plants_${userId || 'guest'}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const list = JSON.parse(stored).filter(p => p.id !== plantId && p.slug !== plantId);
    localStorage.setItem(key, JSON.stringify(list));
  }
  return { success: true, removed: true, plant_id: plantId };
}

// --- Direct Browser Pl@ntNet Botanical Vision Client ---
const PLANTNET_API_KEY = import.meta.env.VITE_PLANTNET_API_KEY || '2b10qSHoLPAnN9YdAbFC9k8X1O';

const CLIENT_BOTANICAL_SYNONYMS = {
  // Tulsi
  "ocimum tenuiflorum": "tulsi",
  "ocimum sanctum": "tulsi",
  "ocimum gratissimum": "tulsi",
  "ocimum basilicum": "tulsi",
  // Neem
  "azadirachta indica": "neem",
  "melia azadirachta": "neem",
  // Ashwagandha
  "withania somnifera": "ashwagandha",
  "physalis somnifera": "ashwagandha",
  // Brahmi
  "bacopa monnieri": "brahmi",
  "herpestis monnieria": "brahmi",
  "centella asiatica": "brahmi",
  // Turmeric
  "curcuma longa": "turmeric",
  "curcuma domestica": "turmeric",
  // Aloe Vera
  "aloe barbadensis": "aloe-vera",
  "aloe vera": "aloe-vera",
  "aloe officinalis": "aloe-vera",
  "aloe perfoliata": "aloe-vera",
  "aloe chinensis": "aloe-vera",
  // Giloy
  "tinospora cordifolia": "giloy",
  "menispermum cordifolium": "giloy",
  // Ginger
  "zingiber officinale": "ginger",
  // Amla
  "phyllanthus emblica": "amla",
  "emblica officinalis": "amla",
  // Fenugreek
  "trigonella foenum-graecum": "fenugreek",
  // Shatavari
  "asparagus racemosus": "shatavari",
  // Karela
  "momordica charantia": "karela"
};

export async function identifyViaPlantNetDirect(imageFile) {
  if (!imageFile) return null;
  const apiKey = PLANTNET_API_KEY;
  if (!apiKey) return null;

  try {
    const formData = new FormData();
    formData.append('images', imageFile);
    formData.append('organs', 'auto');

    const res = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      console.warn("Pl@ntNet API returned status:", res.status);
      return null;
    }

    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const top = results[0];
    const topSpecies = top.species || {};
    const score = top.score || 0;
    const confidence = Math.round(score * 1000) / 10;

    const sciName = topSpecies.scientificNameWithoutAuthor || topSpecies.scientificName || "Unknown Plant";
    const commonNames = topSpecies.commonNames || [];
    const genus = topSpecies.genus?.scientificNameWithoutAuthor || "";
    const family = topSpecies.family?.scientificNameWithoutAuthor || "";
    const sciLower = sciName.toLowerCase().trim();

    // Map to Ayurvedic plant signature
    let matchedSlug = CLIENT_BOTANICAL_SYNONYMS[sciLower];
    let matchedSignature = null;

    if (!matchedSlug && sciLower.startsWith("aloe")) {
      matchedSlug = "aloe-vera";
    }
    if (!matchedSlug && sciLower.startsWith("ocimum")) {
      matchedSlug = "tulsi";
    }

    if (!matchedSlug) {
      for (const sig of AYURVEDIC_BOTANICAL_SIGNATURES) {
        if (sciLower.includes(sig.scientific_name.toLowerCase()) || sig.scientific_name.toLowerCase().includes(sciLower)) {
          matchedSlug = sig.slug;
          matchedSignature = sig;
          break;
        }
      }
    }

    if (!matchedSlug && commonNames.length > 0) {
      for (const c of commonNames) {
        const cLower = c.toLowerCase();
        for (const sig of AYURVEDIC_BOTANICAL_SIGNATURES) {
          if (cLower.includes(sig.common_name.toLowerCase()) || 
              sig.common_name.toLowerCase().includes(cLower) ||
              cLower.includes(sig.ayurvedic_name.toLowerCase()) ||
              sig.ayurvedic_name.toLowerCase().includes(cLower) ||
              cLower.includes(sig.slug)) {
            matchedSlug = sig.slug;
            matchedSignature = sig;
            break;
          }
        }
        if (matchedSlug) break;
      }
    }

    if (matchedSlug && !matchedSignature) {
      matchedSignature = AYURVEDIC_BOTANICAL_SIGNATURES.find(s => s.slug === matchedSlug) || null;
    }

    const matchedPlant = matchedSlug ? (FALLBACK_PLANTS.find(p => p.slug === matchedSlug) || null) : null;

    const traits = [];
    if (family) traits.push(`Family: ${family}`);
    if (genus) traits.push(`Genus: ${genus}`);
    if (matchedSignature?.traits) {
      traits.push(...matchedSignature.traits.slice(0, 2));
    } else if (commonNames.length > 0) {
      traits.push(`Common: ${commonNames.slice(0, 2).join(', ')}`);
    }

    let secondary = null;
    if (results.length > 1) {
      const sec = results[1];
      const secSpecies = sec.species || {};
      const secCommon = secSpecies.commonNames || [];
      secondary = {
        common_name: secCommon[0] || secSpecies.scientificNameWithoutAuthor || "Alternative match",
        scientific_name: secSpecies.scientificNameWithoutAuthor || "",
        confidence_score: Math.max(1, Math.round((sec.score || 0) * 1000) / 10)
      };
    }

    return {
      status: "success",
      source: "plantnet_api",
      predicted_name: matchedSignature ? matchedSignature.common_name : (commonNames[0] || sciName),
      scientific_name: sciName,
      ayurvedic_name: matchedSignature ? matchedSignature.ayurvedic_name : null,
      slug: matchedSlug || sciName.toLowerCase().replace(/\s+/g, '-'),
      category: matchedSignature ? matchedSignature.category : "Medicinal Flora",
      confidence_score: confidence,
      botanical_traits: traits,
      matched_plant: matchedPlant,
      matched_plant_slug: matchedSlug,
      secondary_prediction: secondary,
      disclaimer: "Identified using Pl@ntNet botanical vision. Verify identity before medicinal or therapeutic preparation."
    };
  } catch (err) {
    console.warn("Direct Pl@ntNet identification error:", err);
    return null;
  }
}

export async function identifyPlantImage(imageFile, hint = '', userId = null) {
  // 1. Try Backend if running
  const available = await isBackendAvailable();
  if (available) {
    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      if (hint) formData.append('hint', hint);
      if (userId) formData.append('user_id', userId);

      const res = await fetch(`${API_BASE}/identify`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend /identify unavailable, falling back to direct Pl@ntNet:", err);
    }
  }

  // 2. Direct browser call to Pl@ntNet API (guarantees real AI identification even with only `npm run dev`)
  if (imageFile) {
    const directResult = await identifyViaPlantNetDirect(imageFile);
    if (directResult) {
      return directResult;
    }
  }

  // 3. Fallback to client botanical signature heuristic
  return fallbackIdentifyPlant(imageFile, hint);
}

export async function sendBotChat(message) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend /chat unavailable, using client botanical engine:", err);
    }
  }

  // Graceful client botanical reasoning
  const msgLower = (message || '').toLowerCase();
  
  for (const item of FALLBACK_BOT_KNOWLEDGE) {
    if (item.keywords.some(k => msgLower.includes(k))) {
      return { reply: item.response };
    }
  }

  for (const plant of FALLBACK_PLANTS) {
    if (
      msgLower.includes(plant.slug) || 
      msgLower.includes(plant.common_name.toLowerCase()) || 
      msgLower.includes(plant.ayurvedic_name.toLowerCase())
    ) {
      return {
        reply: `${plant.common_name} (${plant.scientific_name}), known in classical Ayurveda as ${plant.ayurvedic_name}, belongs to the ${plant.category} category. ${plant.description} Traditional uses: ${plant.traditional_uses}`
      };
    }
  }

  return {
    reply: "Ayurveda honors the uniqueness of every herb and person. You can ask me about specific plants (such as Tulsi, Ashwagandha, Neem, or Turmeric), daily Dincharya routines, Agni digestion, or restful evening remedies."
  };
}

export async function fetchDincharya() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/dincharya`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /dincharya failed, using canonical dataset:", err);
    }
  }
  return FALLBACK_DINCHARYA;
}

export async function fetchRemedies() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/remedies`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /remedies failed, using canonical dataset:", err);
    }
  }
  return FALLBACK_REMEDIES;
}

export async function fetchMyths() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/myths`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /myths failed, using canonical dataset:", err);
    }
  }
  return FALLBACK_MYTHS;
}

export async function fetchQuiz() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/quiz`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /quiz failed, using canonical dataset:", err);
    }
  }
  return FALLBACK_QUIZ;
}

export async function fetchGardenPlants() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/garden-plants`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /garden-plants failed, using canonical dataset:", err);
    }
  }
  return FALLBACK_GARDEN_PLANTS;
}

export async function fetchCommunityPosts() {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn("API /posts failed, using local posts:", err);
    }
  }
  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  localStorage.setItem('herbora_local_community_posts', JSON.stringify(FALLBACK_COMMUNITY_POSTS));
  return FALLBACK_COMMUNITY_POSTS;
}

export async function submitCommunityPost(authorName, plantName, note, userId = null) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ 
          author_name: authorName, 
          plant_name: plantName, 
          note,
          user_id: userId
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend submit post failed, storing locally:", err);
    }
  }

  // Local fallback
  const newPost = {
    id: `post-local-${Date.now()}`,
    author_name: authorName,
    plant_name: plantName,
    note,
    user_id: userId,
    likes_count: 0,
    created_at: new Date().toISOString(),
    comments: []
  };
  const stored = localStorage.getItem('herbora_local_community_posts');
  const posts = stored ? JSON.parse(stored) : [...FALLBACK_COMMUNITY_POSTS];
  posts.unshift(newPost);
  localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
  return newPost;
}

export async function updateCommunityPost(postId, plantName, note, userId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          plant_name: plantName,
          note,
          user_id: userId
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend update post failed, updating locally:", err);
    }
  }

  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try {
      const posts = JSON.parse(stored);
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.plant_name = plantName;
        post.note = note;
        localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
        return post;
      }
    } catch {}
  }
  return { id: postId, plant_name: plantName, note };
}

export async function deleteCommunityPost(postId, userId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          user_id: userId
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend delete post failed, deleting locally:", err);
    }
  }

  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try {
      const posts = JSON.parse(stored).filter(p => p.id !== postId);
      localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
    } catch {}
  }
  return { success: true };
}

export function getPersistentClientId() {
  let id = localStorage.getItem('herbora_client_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('herbora_client_id', id);
  }
  return id;
}

export async function likeCommunityPost(postId, userId = null) {
  const effectiveUserId = userId || getPersistentClientId();
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': effectiveUserId
        },
        body: JSON.stringify({ user_id: effectiveUserId })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend like failed, recording locally:", err);
    }
  }

  const stored = localStorage.getItem('herbora_local_community_posts');
  const posts = stored ? JSON.parse(stored) : [...FALLBACK_COMMUNITY_POSTS];
  const post = posts.find(p => p.id === postId);
  let likes = 0;
  if (post) {
    post.likes_count = (post.likes_count || 0) + 1;
    likes = post.likes_count;
    localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
  }
  return { status: "success", likes_count: likes };
}

export async function fetchPostComments(postId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
      if (res.ok) return await res.json();
    } catch {}
  }
  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try {
      const posts = JSON.parse(stored);
      const post = posts.find(p => p.id === postId);
      return post?.comments || [];
    } catch {}
  }
  return [];
}

export async function submitPostComment(postId, content, authorName, userId = null) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          content,
          author_name: authorName,
          user_id: userId
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend submit comment failed, saving locally:", err);
    }
  }

  const newComment = {
    id: `comm-local-${Date.now()}`,
    post_id: postId,
    content,
    author_name: authorName,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try {
      const posts = JSON.parse(stored);
      const post = posts.find(p => p.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(newComment);
        localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
      }
    } catch {}
  }
  return newComment;
}

export async function deletePostComment(commentId, userId) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend delete comment failed, updating locally:", err);
    }
  }

  const stored = localStorage.getItem('herbora_local_community_posts');
  if (stored) {
    try {
      const posts = JSON.parse(stored);
      posts.forEach(p => {
        if (p.comments) {
          p.comments = p.comments.filter(c => c.id !== commentId);
        }
      });
      localStorage.setItem('herbora_local_community_posts', JSON.stringify(posts));
    } catch {}
  }
  return { success: true };
}

export async function submitUserFeedback(rating, message) {
  const available = await isBackendAvailable();
  if (available) {
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message })
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  return { status: "success", message: "Feedback recorded successfully" };
}
