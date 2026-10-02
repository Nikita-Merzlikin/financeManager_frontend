import { clearTokens, getTokens, setTokens } from "@/lib/auth/storage";
import type { ApiErrorBody, AuthTokens } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function refreshTokens(): Promise<AuthTokens | null> {
  const current = getTokens();
  if (!current?.refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lang": "uk",
        "client-type": "client",
        Currency: "UAH",
      },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const tokens = (await res.json()) as AuthTokens;
    setTokens(tokens);
    return tokens;
  } catch {
    clearTokens();
    return null;
  }
}

function formatErrorMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(", ") : body.message;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, retry = true, headers, ...rest } = options;
  const tokens = getTokens();

  const reqHeaders = new Headers(headers);
  if (!reqHeaders.has("Content-Type") && body !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (!reqHeaders.has("x-lang")) reqHeaders.set("x-lang", "uk");
  if (!reqHeaders.has("client-type")) reqHeaders.set("client-type", "client");
  if (!reqHeaders.has("Currency")) reqHeaders.set("Currency", "UAH");

  if (auth && tokens?.accessToken) {
    reqHeaders.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: reqHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && auth && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const errorBody = parsed as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      formatErrorMessage(errorBody, text || `Request failed (${res.status})`),
      errorBody,
    );
  }

  return parsed as T;
}

export function getApiUrl(): string {
  return API_URL;
}
