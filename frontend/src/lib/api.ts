import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function resolveApiAssetUrl(assetPath?: string | null) {
  if (!assetPath) return "";

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedAssetPath = assetPath.startsWith("/")
    ? assetPath
    : `/${assetPath}`;

  return `${normalizedBaseUrl}${normalizedAssetPath}`;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isLoginRequest = requestUrl.includes("/auth/login");
    const isOnLoginPage =
      typeof window !== "undefined" && window.location.pathname === "/login";

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isLoginRequest &&
      !isOnLoginPage
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
