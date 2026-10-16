"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyImport } from "@/lib/actions";
import type { ImportProposal } from "@/lib/types";

export const CHATGPT_PROMPT = `Составь подробное досье обо мне по всему, что ты знаешь из нашей памяти и прошлых разговоров. Ничего не выдумывай: только то, что я сам рассказывал. Пиши по-русски, списками, по разделам:

1. Обо мне: имя, возраст, где живу, характер, ценности, как я люблю получать советы.
2. Бизнес: сеть языковых центров Oxford — направления, студенты, цены, выручка, команда, конкуренты, история.
3. Филиалы: всё, что знаешь о каждом из 7 филиалов.
4. Цели: на год и на 3–5 лет — в бизнесе и в жизни.
5. Текущие вызовы и нерешённые вопросы.
6. Личные финансы: доходы, накопления, активы, планы.
7. Здоровье и спорт.
8. Семья и личная жизнь.
9. Решения, которые я принимал, и их результаты.
10. Всё остальное важное обо мне.

Включи конкретные цифры, имена и даты, если они упоминались.`;

type SectionInfo = { key: string; title: string; content: string };
type Row = { key: string; content: string; checked: boolean };

export function ImportPanel({ sections }: { sections: SectionInfo[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [facts, setFacts] = useState<{ content: string; checked: boolean }[]>([]);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const byKey = new Map(sections.map((s) => [s.key, s]));

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dossier/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      const p = data as ImportProposal;
      setSummary(p.summary);
      setRows(p.sections.filter((s) => byKey.has(s.key)).map((s) => ({ ...s, checked: true })));
      setFacts(p.facts.map((content) => ({ content, checked: true })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    startTransition(async () => {
      await applyImport(
        (rows ?? []).filter((r) => r.checked).map(({ key, content }) => ({ key, content })),
        facts.filter((f) => f.checked).map((f) => f.content),
      );
      setRows(null);
      setText("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="card flex w-full items-center gap-4 p-4 text-left hover:shadow-md">
        <span className="text-2xl">📥</span>
        <span>
          <span className="block text-sm font-medium text-ink-900">Импорт из ChatGPT</span>
          <span className="block text-xs text-ink-500">Перенесите всё, что ChatGPT знает о вас, и советники сразу это учтут</span>
        </span>
      </button>
    );
  }

  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">📥 Импорт из ChatGPT</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-ink-400 hover:text-ink-900">Закрыть</button>
      </div>

      {!rows && (
        <>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">
            <li>Скопируйте запрос ниже и отправьте его в ChatGPT (лучше в новом чате).</li>
            <li>Скопируйте весь ответ ChatGPT и вставьте в поле ниже. Можно вставить и несколько ответов или переписку целиком.</li>
            <li>Нажмите «Разобрать»: проверьте, что получилось, и примените.</li>
          </ol>
          <div className="relative rounded-xl bg-ink-50 p-3">
            <pre className="max-h-40 overflow-y-auto text-xs whitespace-pre-wrap text-ink-700">{CHATGPT_PROMPT}</pre>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(CHATGPT_PROMPT);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="btn-ghost absolute top-2 right-2 py-1 text-xs"
            >
              {copied ? "Скопировано ✓" : "Копировать"}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Вставьте сюда ответ ChatGPT…"
            className="input"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={analyze} disabled={loading || text.trim().length < 20} className="btn-primary">
            {loading ? "Разбираю… (до минуты)" : "Разобрать"}
          </button>
        </>
      )}

      {rows && (
        <>
          {summary && <p className="rounded-xl bg-gold-50 p-3 text-sm text-ink-700">{summary}</p>}
          {rows.length === 0 && facts.length === 0 && <p className="text-sm text-ink-500">Новых сведений не найдено.</p>}
          {rows.map((r, i) => {
            const s = byKey.get(r.key)!;
            return (
              <div key={r.key} className="rounded-xl border border-ink-100 p-3">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-900">
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={(e) => setRows((all) => all!.map((x, j) => (j === i ? { ...x, checked: e.target.checked } : x)))}
                    className="accent-ink-900"
                  />
                  {s.title}
                  {s.content.trim() && <span className="chip bg-ink-50 text-ink-500">обновление</span>}
                </label>
                <textarea
                  value={r.content}
                  onChange={(e) => setRows((all) => all!.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))}
                  rows={Math.min(14, r.content.split("\n").length + 1)}
                  className="input text-sm leading-relaxed"
                />
                {s.content.trim() && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-ink-400">Что было раньше</summary>
                    <pre className="mt-1 text-xs whitespace-pre-wrap text-ink-500">{s.content}</pre>
                  </details>
                )}
              </div>
            );
          })}
          {facts.length > 0 && (
            <div className="rounded-xl border border-ink-100 p-3">
              <p className="mb-2 text-sm font-medium text-ink-900">В память совета</p>
              {facts.map((f, i) => (
                <label key={i} className="flex items-start gap-2 py-1 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={f.checked}
                    onChange={(e) => setFacts((all) => all.map((x, j) => (j === i ? { ...x, checked: e.target.checked } : x)))}
                    className="mt-1 accent-ink-900"
                  />
                  {f.content}
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={apply} disabled={pending} className="btn-primary">
              {pending ? "Сохраняю…" : "✅ Применить к досье"}
            </button>
            <button onClick={() => setRows(null)} className="btn-ghost">Назад</button>
          </div>
        </>
      )}
    </section>
  );
}
