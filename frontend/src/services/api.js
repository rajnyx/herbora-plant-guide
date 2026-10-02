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

// --- Hybrid Supabase + Local Backend Authentication Helpers ---

export async function signUpWithEmail(email, password, fullName = '') {
  // Try Supabase first if available
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
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
  // Try Supabase first if available
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
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
    await supabase.auth.signOut();
  } catch (e) {
    // Supabase unavailable
  }
  localStorage.removeItem('herbora_user_session');
  notifyAuthSubscribers(null);
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
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

// --- Backend Flask REST API Helpers ---

export async function fetchPlants(category = 'All', search = '') {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('q', search);

    const res = await fetch(`${API_BASE}/plants?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch plants: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('API Error fetchPlants:', err);
    // Fallback if backend server not running
    return [];
  }
}

export async function fetchPlantDetails(slugOrId) {
  try {
    const res = await fetch(`${API_BASE}/plants/${slugOrId}`);
    if (!res.ok) throw new Error('Plant not found');
    return await res.json();
  } catch (err) {
    console.error('API Error fetchPlantDetails:', err);
    throw err;
  }
}

export async function searchPlantsLive(q) {
  if (!q || !q.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/plants/search?q=${encodeURIComponent(q.trim())}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
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

  const res = await fetch(`${API_BASE}/identify`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    throw new Error('Image identification failed');
  }
  return await res.json();
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

export async function submitUserFeedback(rating, message) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, message })
  });
  if (!res.ok) throw new Error('Feedback failed');
  return await res.json();
}
