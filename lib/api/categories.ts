import { apiRequest } from "@/lib/api/client";
import type { Category, CreateCategoryDto } from "@/lib/types";

export function listCategories() {
  return apiRequest<Category[]>("/categories");
}

export function createCategory(dto: CreateCategoryDto) {
  return apiRequest<Category>("/categories", { method: "POST", body: dto });
}
