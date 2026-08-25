import axios from "axios";

// In local dev, Vite's proxy (see vite.config.js) forwards "/api" to the
// backend on localhost:5000, so a relative path works fine.
// In production, the frontend and backend are typically deployed as two
// separate services on different domains (e.g. two Render services), so
// there's no proxy — VITE_API_BASE_URL must be set at build time to the
// backend's full URL (e.g. https://govguide-backend.onrender.com/api).
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // send the httpOnly auth cookie
});

// Also attach a bearer token from localStorage as a fallback, in case cookies
// are blocked (e.g. some in-app browsers). The backend accepts either.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("govguide_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize "session expired" handling: if any request comes back 401 and
// we thought we were logged in, clear local state so the UI reflects reality.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("govguide_token");
    }
    return Promise.reject(err);
  }
);

export default api;
