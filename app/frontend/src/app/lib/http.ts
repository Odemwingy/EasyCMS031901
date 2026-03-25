/// <reference types="vite/client" />

import { clearToken, getToken } from "./auth";

const runtimeApiBaseUrl =
  typeof window !== "undefined"
    ? (window as Window & { __EASYCMS_API_BASE_URL?: string }).__EASYCMS_API_BASE_URL
    : undefined;
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = runtimeApiBaseUrl ?? (envApiBaseUrl !== undefined ? envApiBaseUrl : "https://dev-api.easycms.com");

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

/** 仅在存在 JSON 请求体时设置 Content-Type，避免 GET 等无体请求仍带 application/json。 */
function jsonContentTypeIfNeeded(method: string, body: RequestInit["body"]): Record<string, string> {
  const m = method.toUpperCase();
  if (m === "GET" || m === "HEAD") return {};
  if (body == null || body === "") return {};
  if (typeof body === "string") return { "Content-Type": "application/json" };
  return {};
}

/** 后端有时返回 Content-Type 为 text/plain 或非标准值，但正文仍是 JSON；先读文本再解析。 */
async function readApiResponseBody<T>(response: Response): Promise<ApiResponse<T>> {
  const raw = await response.text();
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ApiError(response.statusText || "服务器返回空响应", response.status || 5000);
  }
  try {
    return JSON.parse(trimmed) as ApiResponse<T>;
  } catch {
    const preview = trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
    throw new ApiError(
      `服务器返回非 JSON（${response.status}）：${preview}`,
      response.status || 5000,
    );
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
  const method = (rest.method ?? "GET").toString();
  const token = getToken();
  const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
    ...rest,
    method,
    headers: {
      "X-Request-ID": requestId,
      ...jsonContentTypeIfNeeded(method, rest.body),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = await readApiResponseBody<T>(response);
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
