import { apiRequest } from "@/lib/api/client";
import type {
  AuthTokens,
  CreateUserDto,
  LoginDto,
  RegisterResponse,
} from "@/lib/types";

export function login(dto: LoginDto) {
  return apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: dto,
    auth: false,
  });
}

export function register(dto: CreateUserDto) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: dto,
    auth: false,
  });
}

export function logout(refreshToken: string) {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}
