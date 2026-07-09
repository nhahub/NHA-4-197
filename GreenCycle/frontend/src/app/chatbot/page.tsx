"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatMessage, ApiError } from "@/lib/api";
import type { ChatMessage } from "@/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "I'm the Eco Advisor. Ask me about recycling, pollution, city emissions, or anything from your scan results.",
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await sendChatMessage(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: res.response }]);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Couldn't reach the chatbot service. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-widest text-fern">
        Assistant · POST /api/chat
      </span>
      <h1 className="mt-3 font-display text-4xl font-medium text-canopy">
        Eco Advisor
      </h1>

      <div
        ref={scrollRef}
        className="mt-8 flex h-[50vh] flex-col gap-3 overflow-y-auto border border-line bg-paper p-5"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-canopy text-paper"
                : "self-start border border-line bg-white/60 text-ink"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start border border-line bg-white/60 px-4 py-3 text-sm text-ink/50">
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 border border-clay bg-clay/5 p-3 text-sm text-clay">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about recycling, pollution, or a city's emissions…"
          disabled={loading}
          className="focus-ring flex-1 border border-line bg-paper px-4 py-3 text-sm text-ink"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="focus-ring bg-canopy px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
