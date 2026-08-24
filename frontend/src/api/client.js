import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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
