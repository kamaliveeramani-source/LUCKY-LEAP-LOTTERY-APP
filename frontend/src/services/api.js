import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Centralized token retrieval with comprehensive cleaning and validation
export function getAuthToken() {
  try {
    const storedToken = localStorage.getItem("token");

    // Handle null, undefined, and string literals
    if (!storedToken || storedToken === "undefined" || storedToken === "null") {
      return null;
    }

    // Clean the token: remove Bearer prefix, quotes, and whitespace
    let cleaned = storedToken
      .replace(/^Bearer\s+/i, "")  // Remove "Bearer " prefix
      .replace(/^"|"$/g, "")      // Remove surrounding quotes
      .trim();                      // Remove whitespace

    // Validate it looks like a JWT (has 3 parts separated by dots)
    if (!cleaned || cleaned.split(".").length !== 3) {
      console.warn("[AUTH] Token validation failed: not a valid JWT format");
      return null;
    }

    return cleaned;
  } catch (err) {
    console.error("[AUTH] Error retrieving token:", err.message);
    return null;
  }
}

// Clear token from storage (used on logout/401)
export function clearAuthToken() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    console.log("[AUTH] Token cleared from storage");
  } catch (err) {
    console.error("[AUTH] Error clearing token:", err.message);
  }
}

// Request interceptor: add token to every request
API.interceptors.request.use((config) => {
  const configuredHeader = config.headers?.Authorization || config.headers?.authorization;
  const configuredToken = configuredHeader?.replace(/^Bearer\s+/i, "").trim();
  const token = configuredToken || getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 Unauthorized (expired/invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[AUTH] 401 Unauthorized - clearing token and redirecting to login");
      clearAuthToken();
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;