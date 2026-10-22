import { ApiError, apiFetch, apiRequest } from "@/lib/api/client";
import type { AiChatRequest, AiChatResponse, AiStreamEvent } from "@/lib/types";

export function chat(dto: AiChatRequest) {
  return apiRequest<AiChatResponse>("/ai/chat", { method: "POST", body: dto });
}

export async function* streamChat(
  dto: AiChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<AiStreamEvent> {
  const res = await apiFetch("/ai/chat/stream", {
    method: "POST",
    body: dto,
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || `Stream failed (${res.status})`;
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message)
          ? parsed.message.join(", ")
          : parsed.message;
      }
    } catch {
      // keep raw text
    }
    throw new ApiError(res.status, message);
  }

  if (!res.body) {
    throw new ApiError(500, "No response body for AI stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.replace(/^data:\s?/, "");
      if (!payload || payload === "[DONE]") continue;
      try {
        yield JSON.parse(payload) as AiStreamEvent;
      } catch {
        // ignore malformed SSE frames
      }
    }
  }
}

export const WRITE_AI_TOOLS = new Set([
  "create_transaction",
  "create_account",
]);
