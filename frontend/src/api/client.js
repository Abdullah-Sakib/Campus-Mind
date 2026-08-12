import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { triggerUnauthorized } from "../utils/authEvents";

// Point this at your backend. Use your machine's LAN IP when testing on a
// physical device (localhost won't work from a phone).
// export const API_BASE_URL = "http://localhost:5001/api";
export const API_BASE_URL = "http://10.0.2.2:5050/api"; // Use this for Android emulator
// export const API_BASE_URL = "http://192.168.0.103:5050/api"; //  Use this for physical device testing

// Origin (no trailing /api) — used to build absolute URLs for files served
// from /uploads (documents, project attachments).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const toAbsoluteFileUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
  return `${API_ORIGIN}${relativeUrl}`;
};

// Requests to these paths should never trigger the global "session expired"
// logout flow — a 401 here just means "wrong credentials", not "your
// session expired", since there was no session to begin with.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/google", "/auth/forgot-password", "/auth/reset-password"];

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "ngrok-skip-browser-warning": "true" },
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("campusmind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));

    if (status === 401 && !isAuthEndpoint) {
      // Centralized handling: clear the session and bounce to Login.
      // Individual screens don't need to special-case 401s themselves.
      triggerUnauthorized();
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

export default client;
