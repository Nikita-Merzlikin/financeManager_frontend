"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { clearTokens, getTokens, setTokens } from "@/lib/auth/storage";
import type { CreateUserDto, LoginDto } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: CreateUserDto) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_EVENT = "fm-auth-changed";

function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(AUTH_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUTH_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getAuthSnapshot(): AuthStatus {
  return getTokens() ? "authenticated" : "anonymous";
}

function getServerAuthSnapshot(): AuthStatus {
  return "loading";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const router = useRouter();

  const login = useCallback(
    async (dto: LoginDto) => {
      const tokens = await authApi.login(dto);
      setTokens(tokens);
      emitAuthChange();
      router.replace("/dashboard");
    },
    [router],
  );

  const register = useCallback(
    async (dto: CreateUserDto) => {
      const result = await authApi.register(dto);
      setTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      emitAuthChange();
      router.replace("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    const tokens = getTokens();
    try {
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch {
      // Clear local session even if logout request fails
    } finally {
      clearTokens();
      emitAuthChange();
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({ status, login, register, logout }),
    [status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
