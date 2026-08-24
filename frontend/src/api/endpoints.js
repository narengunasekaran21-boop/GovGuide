import api from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const schemeApi = {
  list: (params) => api.get("/schemes", { params }),
  getById: (id) => api.get(`/schemes/${id}`),
  categories: () => api.get("/schemes/categories"),
  create: (data) => api.post("/schemes", data),
  update: (id, data) => api.put(`/schemes/${id}`, data),
  remove: (id) => api.delete(`/schemes/${id}`),
  checkEligibility: (data) => api.post("/schemes/eligibility-check", data),
};

export const bookmarkApi = {
  list: () => api.get("/bookmarks"),
  add: (schemeId) => api.post(`/bookmarks/${schemeId}`),
  remove: (schemeId) => api.delete(`/bookmarks/${schemeId}`),
};

export const userApi = {
  profile: () => api.get("/users/me/profile"),
  updateProfile: (data) => api.put("/users/me/profile", data),
  recentlyViewed: () => api.get("/users/me/recently-viewed"),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  listUsers: (search) => api.get("/admin/users", { params: { search } }),
  setUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  listAllSchemes: () => api.get("/admin/schemes"),
  activityLogs: (limit) => api.get("/admin/activity-logs", { params: { limit } }),
};
