// api.js
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Detect if running in an emulator (useful for different baseURL)
const isEmulator = Platform.OS === "android" && !Platform.constants.uiMode;

// Choose appropriate base URL for your environment
const getBaseURL = () => {
   // Use environment variable if available
   if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
   }

   // Different URL based on platform and emulator status
   if (Platform.OS === "ios") {
      return isEmulator
         ? "http://localhost:3000/api/v1"
         : "http://192.168.1.100:3000/api/v1";
   } else {
      // For Android emulator, use 10.0.2.2 (special IP that routes to host machine)
      return isEmulator
         ? "http://10.0.2.2:3000/api/v1"
         : "http://192.168.1.100:3000/api/v1";
   }
};

const api = axios.create({
   baseURL: getBaseURL(),
   timeout: 30000,
   headers: {
      Accept: "application/json",
   },
});

// Request interceptor
api.interceptors.request.use(
   async (config) => {
      console.log(
         `Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${
            config.url
         }`
      );

      // Add auth token if available
      const token = await AsyncStorage.getItem("token");
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      // Set appropriate Content-Type header based on data
      if (config.data instanceof FormData) {
         // Don't set Content-Type for FormData - axios will set it with boundary
         // Let the browser/platform set the Content-Type with the correct boundary
         delete config.headers["Content-Type"];
      } else if (typeof config.data === "object") {
         config.headers["Content-Type"] = "application/json";
      }

      return config;
   },
   (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
   }
);

// Response interceptor with better error handling
api.interceptors.response.use(
   (response) => {
      console.log(`Response success from ${response.config.url}`);
      return response;
   },
   (error) => {
      console.error("API Request failed:", error.message);

      // More detailed error logging
      if (error.response) {
         // Server responded with a status code outside of 2xx range
         console.error("Response status:", error.response.status);
         console.error("Response data:", error.response.data);
      } else if (error.request) {
         // Request was made but no response received
         console.error(
            "No response received. Request details:",
            error.request._url || error.request
         );

         // Check network connectivity issues or server status
         if (error.message.includes("Network Error")) {
            console.error(
               "Network error - Check if the server is running and accessible"
            );
         } else if (error.code === "ECONNABORTED") {
            console.error(
               "Request timeout - The request took too long to complete"
            );
         }
      } else {
         // Something else happened while setting up the request
         console.error("Error setting up request:", error.message);
      }

      return Promise.reject(error);
   }
);

export default api;
