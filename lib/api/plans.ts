import { apiRequest } from "@/lib/api/client";
import type {
  CreateFinancialPlanDto,
  FinancialPlan,
  FinancialPlanAiRecommendDto,
  FinancialPlanAiRecommendation,
  FinancialPlanDay,
  FinancialPlanForecast,
} from "@/lib/types";

export function createPlan(dto: CreateFinancialPlanDto) {
  return apiRequest<FinancialPlan>("/financial-plans", {
    method: "POST",
    body: dto,
  });
}

export function getActivePlan() {
  return apiRequest<FinancialPlan>("/financial-plans/active");
}

export function recalculatePlan() {
  return apiRequest<FinancialPlan>("/financial-plans/active/recalculate", {
    method: "POST",
  });
}

export function getPlanCalendar() {
  return apiRequest<FinancialPlanDay[]>("/financial-plans/active/calendar");
}

export function getPlanForecast() {
  return apiRequest<FinancialPlanForecast>("/financial-plans/active/forecast");
}

export function recommendPlanAi(dto: FinancialPlanAiRecommendDto) {
  return apiRequest<FinancialPlanAiRecommendation>(
    "/financial-plans/ai/recommend",
    { method: "POST", body: dto },
  );
}

export function analyzeActivePlanAi() {
  return apiRequest<FinancialPlanAiRecommendation>(
    "/financial-plans/active/ai/analyze",
    { method: "POST" },
  );
}
