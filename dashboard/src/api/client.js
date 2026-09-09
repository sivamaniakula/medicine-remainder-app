import axios from "axios";

// Backend URL. In development this falls back to localhost:5000.
// In production (Vercel), set VITE_API_BASE_URL in your Vercel project's
// Environment Variables to your deployed backend's URL, e.g.
// https://your-backend.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the stored JWT to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
