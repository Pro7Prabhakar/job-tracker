import axios from "axios";

const api = axios.create({
  baseURL: 
  process.env.NODE_ENV === "production" 
    ? "https://job-tracker-64dm.onrender.com/api" 
    : "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response?.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const FILES_BASE_URL = api.defaults.baseURL.replace(/\/api\/?$/i, "");

export default api;
