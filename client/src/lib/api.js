import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
});

export function attachToken(token) {
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}
