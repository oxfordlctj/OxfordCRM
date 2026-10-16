"use client";

import { useState, useTransition } from "react";
import { saveFacts } from "@/lib/actions";

type Fact = { content: string; category: string; checked: boolean };

export function MemoryButton({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  async function extract() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/memory/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setFacts((data.facts as Omit<Fact, "checked">[]).map((f) => ({ ...f, checked: true })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function save() {
    startTransition(async () => {
      await saveFacts(
        facts.filter((f) => f.checked).map(({ content, category }) => ({ content, category })),
        `chat:${conversationId}`,
      );
      setSaved(true);
      setTimeout(() => setOpen(false), 900);
    });
  }

  return (
    <>
      <button onClick={extract} className="btn-ghost shrink-0" title="Сохранить важные факты из разговора в память совета">
        🧠 <span className="hidden sm:inline">Запомнить</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-ink-900">Сохранить в память совета</h2>
            <p className="mt-1 text-xs text-ink-500">
              Эти факты будут учитывать все советники в будущих разговорах. Отметьте нужные и поправьте формулировки.
            </p>
            <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
              {loading && <p className="text-sm text-ink-500">Анализирую разговор…</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!loading && !error && facts.length === 0 && (
                <p className="text-sm text-ink-500">Новых фактов для памяти не найдено.</p>
              )}
              {facts.map((f, i) => (
                <label key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={f.checked}
                    onChange={(e) => setFacts((all) => all.map((x, j) => (j === i ? { ...x, checked: e.target.checked } : x)))}
                    className="mt-2.5 accent-ink-900"
                  />
                  <textarea
                    value={f.content}
                    onChange={(e) => setFacts((all) => all.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))}
                    rows={2}
                    className="input resize-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghost">Закрыть</button>
              <button
                onClick={save}
                disabled={pending || saved || !facts.some((f) => f.checked)}
                className="btn-primary"
              >
                {saved ? "Сохранено ✓" : pending ? "Сохраняю…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
