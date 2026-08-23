import axios from "axios";

// One shared axios instance — every part of the app imports THIS,
// instead of calling axios directly. Makes it trivial to change the
// backend URL later (e.g. when you deploy), and to auto-attach the
// login token to every request.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Runs before every request — if we have a saved token, attach it.
// This is what lets protected routes (profile, dashboard) know who's asking.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
