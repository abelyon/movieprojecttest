import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

export async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie');
}

// Auth (Fortify)
export async function login(email: string, password: string) {
  await getCsrfCookie();
  await api.post('/login', { email, password });
}

export async function register(name: string, email: string, password: string, password_confirmation: string) {
  await getCsrfCookie();
  await api.post('/register', { name, email, password, password_confirmation });
}

export async function logout() {
  await api.post('/logout');
}

// User
export async function fetchUser() {
  const { data } = await api.get('/api/user');
  return data;
}

export async function updateUser(payload: { name?: string; email?: string }) {
  const { data } = await api.put('/api/user', payload);
  return data;
}

// TMDB proxy
export async function fetchTrending(timeWindow = 'day') {
  const { data } = await api.get('/api/tmdb/trending', { params: { time_window: timeWindow } });
  return data;
}

export async function searchTmdb(query: string, page = 1) {
  const { data } = await api.get('/api/tmdb/search', { params: { query, page } });
  return data;
}

export async function fetchMovie(id: number) {
  const { data } = await api.get(`/api/tmdb/movie/${id}`);
  return data;
}

export async function fetchTv(id: number) {
  const { data } = await api.get(`/api/tmdb/tv/${id}`);
  return data;
}

// Saved
export async function fetchSaved() {
  const { data } = await api.get('/api/saved');
  return data;
}

export async function addSaved(tmdb_id: number, media_type: 'movie' | 'tv', liked?: boolean | null) {
  const { data } = await api.post('/api/saved', { tmdb_id, media_type, liked });
  return data;
}

export async function updateSaved(id: number, liked: boolean | null) {
  const { data } = await api.put(`/api/saved/${id}`, { liked });
  return data;
}

export async function removeSaved(id: number) {
  await api.delete(`/api/saved/${id}`);
}
