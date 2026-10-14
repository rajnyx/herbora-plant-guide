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

// --- Hybrid Supabase + Local Backend Authentication Helpers ---

export async function signUpWithEmail(email, password, fullName = '') {
  // Try Supabase first if available with timeout
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
    console.warn("Supabase auth unavailable, using Herbora backend auth:", supabaseErr.message);
  }

  // Fallback to Herbora backend auth
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
}

export async function signInWithEmail(email, password) {
  // Try Supabase first if available with timeout
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
    console.warn("Supabase auth unavailable, using Herbora backend auth:", supabaseErr.message);
  }

  // Fallback to Herbora backend auth
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
}

export async function signOutUser() {
  try {
    await withTimeout(supabase.auth.signOut(), 1000);
  } catch (e) {
    // Supabase unavailable
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
  } catch (e) {
    // Supabase unavailable
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

  // Also listen to Supabase if active
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
    // Supabase unavailable
  }

  return () => {
    authSubscribers.delete(callback);
    unsubscribeSupabase();
  };
}

// --- Embedded Canonical Ayurvedic Botanical Knowledge Dataset ---
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
    cultivation_information: "Deep-rooted, drought resistant, grows well in dry soils and requires full bright sunshine.",
    safety_information: "Pure neem seed oil is toxic if ingested internally and must never be swallowed, especially by children. For external use, always perform a patch test.",
    image_url: "/assets/neem.jpg",
    is_published: true
  },
  {
    id: "plant-brahmi",
    slug: "brahmi",
    common_name: "Water Hyssop",
    scientific_name: "Bacopa monnieri",
    ayurvedic_name: "Brahmi",
    regional_names: ["Jalabrahmi", "Herpestis monniera", "Aindri"],
    category: "Stress Relief",
    description: "A premier Medhya Rasayana (mind and intellect rejuvenator), this creeping succulent has supported meditation, memory, and cognitive tranquility for millennia.",
    traditional_uses: "Traditionally prepared with ghee or warm water to nourish Majja dhatu (nervous tissue), sharpen concentration, and reduce mental fatigue.",
    plant_parts_used: "Whole succulent plant and leaves",
    habitat: "Wetlands, marshy ground, pond edges, and damp soils throughout warm regions.",
    cultivation_information: "Requires high moisture or boggy soil conditions and bright, indirect to direct light.",
    safety_information: "Large doses on an empty stomach may cause mild gastrointestinal upset. Note: distinct from Gotu Kola (Centella asiatica), which is also sometimes called Brahmi in north India.",
    image_url: "/assets/brahmi.jpg",
    is_published: true
  },
  {
    id: "plant-turmeric",
    slug: "turmeric",
    common_name: "Turmeric",
    scientific_name: "Curcuma longa",
    ayurvedic_name: "Haridra",
    regional_names: ["Haldi", "Kanchani", "Golden Spice"],
    category: "Heart Health",
    description: "A sacred golden rhizome in the ginger family, revered both as a daily culinary cornerstone and as a potent tridoshic purifying herb.",
    traditional_uses: "Traditionally simmered with milk and black pepper (Golden Milk) to relieve stiffness, purify circulation, and foster skin radiance.",
    plant_parts_used: "Rhizome (underground root stem)",
    habitat: "Humid tropical areas with heavy annual rainfall and fertile organic soil.",
    cultivation_information: "Planted after the last frost in warm partial shade. Requires moist, well-draining soil.",
    safety_information: "Culinary amounts are safe for almost everyone. High concentrated curcumin extracts may aggravate gallstones or interact with blood thinners.",
    image_url: "/assets/turmeric.jpg",
    is_published: true
  },
  {
    id: "plant-aloe-vera",
    slug: "aloe-vera",
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis",
    ayurvedic_name: "Kumari",
    regional_names: ["Ghritkumari", "Gwarpatha", "Korphad"],
    category: "Digestion",
    description: "Named “Kumari” (young maiden) reflecting its affinity for youthfulness, hormonal balance, and cooling liver support.",
    traditional_uses: "Clear inner leaf fillet consumed for cooling Pitta heat and soothing digestive mucous membranes; applied externally for sunburns.",
    plant_parts_used: "Inner clear leaf gel (excluding the bitter yellow aloin latex)",
    habitat: "Dry, sub-tropical arid zones of the Mediterranean, Africa, and Rajasthan.",
    cultivation_information: "Succulent requiring sandy cactus potting mix, minimal watering, and bright light.",
    safety_information: "Do not ingest whole leaf preparations containing the yellow latex sap (aloin), which is a potent laxative and contra-indicated in pregnancy.",
    image_url: "/assets/aloe-vera.jpg",
    is_published: true
  },
  {
    id: "plant-ginger",
    slug: "ginger",
    common_name: "Ginger",
    scientific_name: "Zingiber officinale",
    ayurvedic_name: "Shunthi / Adrak",
    regional_names: ["Nagara", "Maha-aushadhi", "Universal Medicine"],
    category: "Digestion",
    description: "Known as “Vishwabheshaja” (the universal remedy), ginger is praised for kindling Agni (digestive fire) without provoking excessive heat.",
    traditional_uses: "Fresh ginger tea before meals stimulates appetite and eases nausea; dried ginger powder is used for respiratory comfort.",
    plant_parts_used: "Rhizome",
    habitat: "Cultivated globally across warm, humid subtropical climates.",
    cultivation_information: "Grows well in pots or garden beds with partial sun and consistently moist, rich compost.",
    safety_information: "Caution in active bleeding conditions or concurrent blood-thinning therapies.",
    image_url: "/assets/daily-wellness.jpg",
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
    description: "Known as “Amrita” (nectar of immortality), Guduchi is a climbing deciduous shrub famous for its ability to balance all three doshas without creating heat.",
    traditional_uses: "Classical root and stem decoctions used for lingering low fevers, cellular immunity, and natural detoxification.",
    plant_parts_used: "Mature stem and aerial roots",
    habitat: "Tropical deciduous and dry forests climbing upon Neem and Mango trees.",
    cultivation_information: "Very hardy vine propagated easily from cuttings; thrives in moist soil with trellis support.",
    safety_information: "Generally well-tolerated. Diabetics should monitor blood sugar levels as it may potentiate hypoglycemic medicines.",
    image_url: "/assets/herbal-wellness.jpg",
    is_published: true
  },
  {
    id: "plant-amla",
    slug: "amla",
    common_name: "Indian Gooseberry",
    scientific_name: "Phyllanthus emblica",
    ayurvedic_name: "Amalaki",
    regional_names: ["Amla", "Dhatri", "Emblic Myrobalan", "Nellikai"],
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

// --- Backend Flask REST API Helpers ---

export async function fetchPlants(category = 'All', search = '') {
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
    console.warn('API Error fetchPlants, utilizing embedded botanical library:', err);
  }

  // Graceful fallback to embedded 12-plant botanical catalog
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
  try {
    const res = await fetch(`${API_BASE}/plants/${slugOrId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API Error fetchPlantDetails, searching fallback:', err);
  }
  const match = FALLBACK_PLANTS.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (match) return match;
  throw new Error('Plant not found in Herbora database');
}

export async function searchPlantsLive(q) {
  if (!q || !q.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/plants/search?q=${encodeURIComponent(q.trim())}`);
    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) return results;
    }
  } catch {
    // Fall back to local search
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
  try {
    const res = await fetch(`${API_BASE}/my-plants?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('API Error fetchMySavedPlants:', err);
    return [];
  }
}

export async function savePlantToDb(plantId, userId, notes = '') {
  const res = await fetch(`${API_BASE}/plants/${plantId}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId || ''
    },
    body: JSON.stringify({ user_id: userId, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save plant');
  }
  return await res.json();
}

export async function removePlantFromDb(plantId, userId) {
  const res = await fetch(`${API_BASE}/plants/${plantId}/save`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId || ''
    },
    body: JSON.stringify({ user_id: userId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to remove plant');
  }
  return await res.json();
}

export async function identifyPlantImage(imageFile, hint = '', userId = null) {
  const formData = new FormData();
  if (imageFile) {
    formData.append('image', imageFile);
  }
  if (hint) formData.append('hint', hint);
  if (userId) formData.append('user_id', userId);

  try {
    const res = await fetch(`${API_BASE}/identify`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || 'Image identification failed');
    }
    return await res.json();
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err;
    }
    throw new Error('Unable to connect to plant identification server. Please ensure the backend is running on port 5000.');
  }
}

export async function sendBotChat(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Chat failed');
  return await res.json();
}

export async function fetchDincharya() {
  const res = await fetch(`${API_BASE}/dincharya`);
  return await res.json();
}

export async function fetchRemedies() {
  const res = await fetch(`${API_BASE}/remedies`);
  return await res.json();
}

export async function fetchMyths() {
  const res = await fetch(`${API_BASE}/myths`);
  return await res.json();
}

export async function fetchQuiz() {
  const res = await fetch(`${API_BASE}/quiz`);
  return await res.json();
}

export async function fetchGardenPlants() {
  const res = await fetch(`${API_BASE}/garden-plants`);
  return await res.json();
}

export async function fetchCommunityPosts() {
  const res = await fetch(`${API_BASE}/posts`);
  return await res.json();
}

export async function submitCommunityPost(authorName, plantName, note, userId = null) {
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit post');
  }
  return await res.json();
}

export async function updateCommunityPost(postId, plantName, note, userId) {
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update post');
  }
  return await res.json();
}

export async function deleteCommunityPost(postId, userId) {
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete post');
  }
  return await res.json();
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
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': effectiveUserId
    },
    body: JSON.stringify({ user_id: effectiveUserId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to like post');
  }
  return await res.json();
}

export async function fetchPostComments(postId) {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function submitPostComment(postId, content, authorName, userId = null) {
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit comment');
  }
  return await res.json();
}

export async function deletePostComment(commentId, userId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId || ''
    },
    body: JSON.stringify({ user_id: userId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete comment');
  }
  return await res.json();
}

export async function submitUserFeedback(rating, message) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, message })
  });
  if (!res.ok) throw new Error('Feedback failed');
  return await res.json();
}
