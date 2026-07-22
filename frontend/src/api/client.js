import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Point this at your backend. Use your machine's LAN IP when testing on a
// physical device (localhost won't work from a phone).
// export const API_BASE_URL = "http://localhost:5001/api";
export const API_BASE_URL = "http://10.0.2.2:5050/api"; // Use this for Android emulator
// export const API_BASE_URL = "http://192.168.0.103:5050/api"; //  Use this for physical device testing

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
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  },
);

export default client;
