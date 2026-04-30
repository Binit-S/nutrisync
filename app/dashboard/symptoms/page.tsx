"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SymptomsChatPage() {
  const { user } = useAuth();
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  return (
    <div className="app-shell animate-fade-in flex flex-col h-[calc(100vh-80px)]">
      <div className="max-w-4xl mb-4">
        <h1 className="text-2xl font-bold">Real-time Consultant</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Chat with our dietitian agent about your symptoms to identify potential gaps.
        </p>
      </div>

      <div className="flex-1 surface-panel flex flex-col overflow-hidden min-h-[500px]">
        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] space-y-4">
              <div className="h-16 w-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-2xl">
                👋
              </div>
              <div>
                <p className="font-bold text-lg mb-1 text-[var(--text-primary)]">Hello! I'm your Dietitian Agent.</p>
                <p className="max-w-md mx-auto">
                  Tell me how you're feeling lately. Any fatigue, brain fog, skin issues, or digestion problems? I'll help identify the gaps.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-[1.25rem] ${
                    m.role === "user" 
                      ? "bg-[var(--bg-ink)] text-white rounded-tr-sm" 
                      : "bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm"
                  }`}
                >
                  {m.role !== "user" && <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-warm)] mb-2">Agent</p>}
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">
                    {m.parts 
                      ? m.parts.map((p, i) => p.type === 'text' ? <span key={i}>{p.text}</span> : null)
                      : (m as any).content}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && messages.length > 0 && messages[messages.length-1].role === "user" && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-4 rounded-[1.25rem] rounded-tl-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action hints */}
        {messages.length > 2 && !isLoading && (
          <div className="px-5 sm:px-8 pb-2 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Got your deficiencies? <Link href="/dashboard/consult" className="text-[var(--accent-warm)] font-bold hover:underline">Head over to the Dietitian Agent tab</Link> and enter them in "Known Gap" mode.
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 sm:p-6 bg-white border-t border-[var(--border-subtle)]">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
            <input
              value={input || ""}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., I've been feeling really tired and my nails are brittle..."
              className="flex-1 input-field py-4"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !(input || "").trim()} 
              className="btn-primary shrink-0 px-8 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
