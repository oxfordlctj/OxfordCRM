"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { readNdjson } from "@/lib/ndjson-client";
import { DecisionDraftForm, type DraftAdvisor } from "./DecisionDraftForm";
import { Markdown } from "./Markdown";
import type { DecisionDraft } from "@/lib/types";

type Person = { id: number; name: string; emoji: string; title: string };
type Turn = { advisorId: number | null; round: number; content: string };
type Status = "pending" | "running" | "done" | "error";
type TurnState = { content: string; streaming: boolean };

const ROUND_TITLES: Record<number, string> = {
  1: "Раунд 1 · Позиции советников",
  2: "Раунд 2 · Дебаты",
  3: "Итог Председателя",
};

export function MeetingClient({
  meetingId,
  mode,
  initialStatus,
  participants,
  chair,
  initialTurns,
  taskAdvisors,
  decisionId,
}: {
  meetingId: string;
  mode: "express" | "full";
  initialStatus: Status;
  participants: Person[];
  chair: Person | null;
  initialTurns: Turn[];
  taskAdvisors: DraftAdvisor[];
  decisionId: number | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Record<string, TurnState>>(() =>
    Object.fromEntries(initialTurns.map((t) => [`${t.round}:${t.advisorId}`, { content: t.content, streaming: false }])),
  );
  const [draft, setDraft] = useState<DecisionDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const started = useRef(false);

  async function run(force = false) {
    started.current = true;
    setError(null);
    setStatus("running");
    setTurns({});
    try {
      const res = await fetch(`/api/board/${meetingId}/run${force ? "?force=1" : ""}`, { method: "POST" });
      await readNdjson<{ type: string; round?: number; advisorId?: number; text?: string; message?: string }>(res, (ev) => {
        const key = `${ev.round}:${ev.advisorId}`;
        if (ev.type === "turn_start") {
          setTurns((t) => ({ ...t, [key]: { content: "", streaming: true } }));
        } else if (ev.type === "delta") {
          setTurns((t) => ({ ...t, [key]: { content: (t[key]?.content ?? "") + ev.text, streaming: true } }));
        } else if (ev.type === "turn_end") {
          setTurns((t) => ({ ...t, [key]: { ...t[key], streaming: false } }));
        } else if (ev.type === "done") {
          setStatus("done");
        } else if (ev.type === "error") {
          setStatus("error");
          setError(ev.message ?? "Ошибка");
        }
      });
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    if (initialStatus === "pending" && !started.current) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function makeDraft() {
    setDraftLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/board/${meetingId}/decision`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setDraft(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDraftLoading(false);
    }
  }

  const rounds = mode === "full" && participants.length > 1 ? [1, 2] : [1];
  const chairTurn = chair ? turns[`3:${chair.id}`] : undefined;

  return (
    <div className="space-y-8">
      {status === "running" && Object.keys(turns).length === 0 && (
        <div className="card p-6 text-center text-sm text-ink-500">
          {initialStatus === "running" && !started.current ? (
            <>
              <p>Это заседание было начато, но прервано (например, закрыли вкладку).</p>
              <button onClick={() => run(true)} className="btn-primary mt-3">Перезапустить заседание</button>
            </>
          ) : (
            "Советники рассаживаются за столом…"
          )}
        </div>
      )}

      {rounds.map((round) => {
        const has = participants.some((p) => turns[`${round}:${p.id}`]);
        if (!has) return null;
        return (
          <section key={round}>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">{ROUND_TITLES[round]}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {participants.map((p) => {
                const t = turns[`${round}:${p.id}`];
                if (!t) return null;
                return (
                  <article key={p.id} className="card p-4">
                    <header className="mb-2 flex items-center gap-2">
                      <span className="text-xl">{p.emoji}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-900">{p.name}</span>
                        <span className="block truncate text-xs text-ink-400">{p.title}</span>
                      </span>
                      {t.streaming && <span className="chip ml-auto bg-gold-50 text-gold-600">говорит…</span>}
                    </header>
                    {t.content ? (
                      <Markdown className={t.streaming ? "cursor-blink" : ""}>{t.content}</Markdown>
                    ) : (
                      <p className="text-sm text-ink-400">Обдумывает позицию…</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {chair && chairTurn && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">{ROUND_TITLES[3]}</h2>
          <article className="rounded-2xl border-2 border-gold-300 bg-white p-5 shadow-sm">
            <header className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{chair.emoji}</span>
              <span className="font-semibold text-ink-900">{chair.name}</span>
              {chairTurn.streaming && <span className="chip ml-auto bg-gold-50 text-gold-600">подводит итог…</span>}
            </header>
            {chairTurn.content ? (
              <Markdown className={chairTurn.streaming ? "cursor-blink" : ""}>{chairTurn.content}</Markdown>
            ) : (
              <p className="text-sm text-ink-400">Председатель изучает позиции…</p>
            )}
          </article>
        </section>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          {status === "error" && (
            <button onClick={() => run(true)} className="btn-ghost ml-3">Перезапустить</button>
          )}
        </div>
      )}
      {status === "error" && !error && (
        <div className="card p-4 text-sm text-ink-600">
          Заседание было прервано.
          <button onClick={() => run(true)} className="btn-primary ml-3">Перезапустить</button>
        </div>
      )}

      {status === "done" && (
        <section className="card p-5">
          {decisionId ? (
            <p className="text-sm text-ink-700">
              ✅ Решение по этому заседанию зафиксировано.{" "}
              <Link href="/decisions" className="font-medium text-gold-600 hover:underline">Открыть журнал решений →</Link>
            </p>
          ) : draft ? (
            <DecisionDraftForm meetingId={meetingId} draft={draft} advisors={taskAdvisors} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink-900">Зафиксировать решение</h3>
                <p className="text-sm text-ink-500">Секретарь совета превратит итог в решение и поручения с датами.</p>
              </div>
              <button onClick={makeDraft} disabled={draftLoading} className="btn-gold">
                {draftLoading ? "Готовлю проект…" : "📝 Подготовить решение"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
