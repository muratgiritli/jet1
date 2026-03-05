import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "Kedim neden çok su içiyor?",
  "Yavru köpek ne sıklıkla beslenmeli?",
  "Muhabbet kuşu bakımı nasıl olmalı?",
  "Kedi kumunu ne sıklıkla değişmeliyim?",
];

export default function PetAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(question?: string) {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/pet-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || data.error || "Bir hata oluştu." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Bağlantı hatası, lütfen tekrar deneyin." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-3 py-4" data-testid="section-pet-ai-chat">
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Yapay Zeka Pet Danışmanı</h3>
            <p className="text-purple-200 text-[10px]">Evcil hayvan bakım ve sağlık soruları</p>
          </div>
        </div>

        <div ref={scrollRef} className="px-3 py-3 space-y-2 max-h-72 overflow-y-auto min-h-[80px]">
          {messages.length === 0 && !loading && (
            <div className="text-center py-2">
              <Bot className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-3">
                Evcil hayvanınız hakkında merak ettiklerinizi sorun!
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full bg-purple-100 text-purple-700 active:bg-purple-200 transition-colors"
                    data-testid={`btn-suggestion-${idx}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`chat-message-${msg.role}-${i}`}
            >
              {msg.role === "ai" && (
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start" data-testid="chat-loading">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
                <span className="text-[11px] text-gray-500">Düşünüyor...</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 pb-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorunuzu yazın..."
              className="flex-1 text-xs px-3 py-2.5 rounded-full border border-purple-200 bg-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-300"
              disabled={loading}
              data-testid="input-pet-ai-question"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              data-testid="btn-pet-ai-send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
