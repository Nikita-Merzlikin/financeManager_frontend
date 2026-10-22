"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useRef, useState } from "react";
import { WRITE_AI_TOOLS, streamChat } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";

type Message = {
  role: "user" | "assistant" | "status";
  text: string;
};

export function AiChatPage() {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || pending) return;

    setInput("");
    setError(null);
    setPending(true);
    setMessages((m) => [...m, { role: "user", text: message }]);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let assistant = "";
    setMessages((m) => [...m, { role: "assistant", text: "" }]);

    try {
      for await (const event of streamChat(
        { message, conversationId },
        controller.signal,
      )) {
        if (event.type === "status") {
          setMessages((m) => [...m, { role: "status", text: event.message }]);
        } else if (event.type === "text_delta") {
          assistant += event.text;
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: "assistant", text: assistant };
            return next;
          });
        } else if (event.type === "done") {
          assistant = event.reply || assistant;
          setConversationId(event.conversationId);
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: "assistant", text: assistant };
            return next;
          });
          const writes = (event.toolsUsed ?? []).some((t) => WRITE_AI_TOOLS.has(t));
          if (writes) {
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
            await qc.invalidateQueries({ queryKey: ["transactions"] });
            await qc.invalidateQueries({ queryKey: ["accounts"] });
          }
        } else if (event.type === "error") {
          setError(event.message);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof ApiError ? err.message : "Stream failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1>AI assistant</h1>
        <p className="period-hint">Streaming chat with finance tools.</p>
      </header>

      <section className="panel chat-panel">
        <div className="chat-log">
          {messages.length === 0 ? (
            <p className="empty">Ask about balances, spend, or plans.</p>
          ) : null}
          {messages.map((m, i) => (
            <div key={`${m.role}-${i}`} className={`chat-bubble ${m.role}`}>
              {m.text || (m.role === "assistant" && pending ? "…" : null)}
            </div>
          ))}
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="chat-form" onSubmit={(e) => void onSubmit(e)}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message…"
            disabled={pending}
            maxLength={4000}
          />
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? "…" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
