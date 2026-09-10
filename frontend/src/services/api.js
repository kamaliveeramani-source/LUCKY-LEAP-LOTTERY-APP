import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
const normalizedApiBase = rawApiUrl.replace(/\/+$/, "");
const API = axios.create({
  baseURL: normalizedApiBase.endsWith("/api")
    ? normalizedApiBase
    : `${normalizedApiBase}/api`,
});

export function getAuthToken() {
  try {
    const storedToken = localStorage.getItem("token");

    if (!storedToken || storedToken === "undefined" || storedToken === "null") {
      return null;
    }

    const cleaned = storedToken
      .replace(/^Bearer\s+/i, "")
      .replace(/^"|"$/g, "")
      .trim();

    if (!cleaned || cleaned.split(".").length !== 3) {
      return null;
    }

    return cleaned;
  } catch (err) {
    return null;
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
  } catch (err) {
    // Ignore storage cleanup errors.
  }
}

API.interceptors.request.use((config) => {
  const configuredHeader = config.headers?.Authorization || config.headers?.authorization;
  const configuredToken = configuredHeader?.replace(/^Bearer\s+/i, "").trim();
  const token = configuredToken || getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;