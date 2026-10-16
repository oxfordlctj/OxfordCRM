"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { readNdjson } from "@/lib/ndjson-client";
import { Markdown } from "./Markdown";
import { MemoryButton } from "./MemoryButton";

type Msg = { role: "user" | "assistant"; content: string };
type AdvisorInfo = { slug: string; name: string; title: string; emoji: string; description: string };

const STARTERS: Record<string, string[]> = {
  ceo: [
    "Стоит ли открывать 8-й филиал в этом году? Какие вопросы мне нужно себе задать?",
    "Какие новые направления могут дать сети Oxford рост на 30% за год?",
  ],
  cfo: [
    "Помогите составить простую таблицу P&L по каждому филиалу.",
    "Как понять, какой филиал на самом деле прибыльный, а какой тянет сеть вниз?",
  ],
  cmo: [
    "Составьте план набора студентов на следующий сезон по каналам с бюджетом.",
    "Какой контент делать в Instagram и Telegram, чтобы приходили заявки?",
  ],
  sales: [
    "Напишите скрипт для администратора: от заявки до оплаты курса.",
    "Как снизить отток студентов после первого месяца?",
  ],
  coo: [
    "Какие 7 метрик каждый управляющий филиалом должен сдавать мне раз в неделю?",
    "Как сделать, чтобы филиалы работали без моего постоянного участия?",
  ],
  hr: ["Как построить систему оплаты преподавателей, которая мотивирует удерживать студентов?"],
  academic: ["Как ввести единый стандарт качества уроков во всех 7 филиалах?"],
  lawyer: ["Какие пункты обязательно должны быть в договоре со студентом?"],
  wealth: ["Как правильно разделить деньги бизнеса и семьи и сколько платить себе?"],
  doctor: ["Какие обследования мне стоит пройти в этом году по возрасту?"],
  coach: ["Составьте план тренировок на 3 раза в неделю по 40 минут."],
  psychologist: ["Чувствую усталость и тревогу из-за бизнеса. С чего начать?"],
  family: ["Как выделять больше качественного времени семье при плотном графике?"],
  mentor: ["Помогите сформулировать моё видение жизни на 10 лет вперёд."],
};
const DEFAULT_STARTERS = ["Познакомьтесь со мной: какие вопросы вы бы задали, чтобы лучше помогать?"];

export function ChatClient({
  advisor,
  conversationId: initialId,
  initialMessages,
}: {
  advisor: AdvisorInfo;
  conversationId: string | null;
  initialMessages: Msg[];
}) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorSlug: advisor.slug, conversationId, message }),
        signal: abort.signal,
      });
      await readNdjson<{ type: string; text?: string; message?: string; conversationId?: string }>(res, (ev) => {
        if (ev.type === "start" && ev.conversationId && !conversationId) {
          setConversationId(ev.conversationId);
          window.history.replaceState(null, "", `/chat/${ev.conversationId}`);
        } else if (ev.type === "delta" && ev.text) {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + ev.text };
            return copy;
          });
        } else if (ev.type === "error") {
          setError(ev.message ?? "Ошибка");
        }
      });
      router.refresh();
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setBusy(false);
      // убираем пустой ответ, если советник не успел ничего сказать
      setMessages((m) => (m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content ? m.slice(0, -1) : m));
    }
  }

  const starters = STARTERS[advisor.slug] ?? DEFAULT_STARTERS;

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-4rem)]">
      <div className="flex items-center gap-3 border-b border-ink-100 pb-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-2xl">
          {advisor.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-ink-900">{advisor.name}</h1>
          <p className="truncate text-xs text-ink-500">{advisor.title}</p>
        </div>
        {conversationId && messages.length > 1 && !busy && <MemoryButton conversationId={conversationId} />}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="mx-auto max-w-xl py-6 text-center">
            <div className="mb-3 text-5xl">{advisor.emoji}</div>
            <p className="text-sm text-ink-600">{advisor.description}</p>
            <div className="mt-6 flex flex-col gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-ink-100 bg-white px-4 py-3 text-left text-sm text-ink-700 hover:border-gold-300 hover:bg-gold-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-4 py-2.5 text-sm whitespace-pre-wrap text-white">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-2">
              <span className="mt-1 text-xl">{advisor.emoji}</span>
              <div className="card max-w-[90%] min-w-0 px-4 py-3">
                {m.content ? (
                  <Markdown className={busy && i === messages.length - 1 ? "cursor-blink" : ""}>
                    {m.content}
                  </Markdown>
                ) : (
                  <span className="text-sm text-ink-400">Думает…</span>
                )}
              </div>
            </div>
          ),
        )}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-ink-100 pt-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={Math.min(6, Math.max(1, input.split("\n").length))}
          placeholder={`Вопрос для: ${advisor.name}…`}
          className="input resize-none"
        />
        {busy ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className="btn-ghost shrink-0">
            Стоп
          </button>
        ) : (
          <button className="btn-primary shrink-0" disabled={!input.trim()}>
            Отправить
          </button>
        )}
      </form>
    </div>
  );
}
