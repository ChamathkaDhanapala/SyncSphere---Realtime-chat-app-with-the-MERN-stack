import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`, 
});


api.interceptors.request.use((config) => {
  console.log("=== API REQUEST DEBUG ===");
  console.log("Method:", config.method);
  console.log("Endpoint:", config.url);
  console.log("Base URL:", config.baseURL);
  console.log("Full URL:", config.baseURL + config.url);
  console.log("Headers:", config.headers);
  console.log("Data:", config.data);
  console.log("========================");
  return config;
});

// Add response debugging too
api.interceptors.response.use(
  (response) => {
    console.log("=== API RESPONSE SUCCESS ===");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("========================");
    return response;
  },
  (error) => {
    console.log("=== API RESPONSE ERROR ===");
    console.log("URL:", error.config.url);
    console.log("Status:", error.response?.status);
    console.log("Error:", error.message);
    console.log("Full error:", error);
    console.log("========================");
    return Promise.reject(error);
  }
);

export function attachToken(token) {
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}