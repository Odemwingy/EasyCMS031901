import { clearToken, getToken } from "./auth";

const windowApiBaseUrl =
  typeof window !== "undefined"
    ? (window as Window & { __EASYCMS_API_BASE_URL?: string }).__EASYCMS_API_BASE_URL
    : undefined;
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = windowApiBaseUrl ?? (envApiBaseUrl !== undefined ? envApiBaseUrl : "https://dev-api.easycms.com");

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ApiListData<T> {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  list: T[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildQuery(query?: Record<string, unknown>) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function httpRequest<T>(
  path: string,
  options: RequestInit & {
    query?: Record<string, unknown>;
    auth?: boolean;
  } = {},
): Promise<T> {
  const { query, auth = true, headers, ...rest } = options;
  const token = getToken();
  const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (payload.code === 1002) {
    clearToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }
  if (!response.ok || payload.code !== 0) {
    throw new ApiError(payload.message || "请求失败", payload.code ?? 5000);
  }
  return payload.data;
}
