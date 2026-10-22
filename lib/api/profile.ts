import { apiRequest } from "@/lib/api/client";
import type { Profile, UpdateProfileDto } from "@/lib/types";

export function getProfile() {
  return apiRequest<Profile>("/profile");
}

export function updateProfile(dto: UpdateProfileDto) {
  return apiRequest<Profile>("/profile", { method: "PATCH", body: dto });
}

export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<Profile>("/profile/avatar", {
    method: "PATCH",
    body: form,
  });
}
