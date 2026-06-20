import axios from "axios";

const TOKEN_KEY = "jobtrack_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// All requests go to /api (Vite proxies that to the backend on :4000).
const api = axios.create({ baseURL: "/api" });

// Attach the JWT to every request automatically.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
