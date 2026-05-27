import axios from "axios";
import { logout } from "./auth";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      logout();
      window.location.replace("/");
    }

    if (status === 403 && !window.location.pathname.includes("/unauthorized")) {
      window.location.replace("/unauthorized");
    }

    return Promise.reject(error);
  }
);

export default API;
