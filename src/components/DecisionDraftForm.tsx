"use client";

import { useState, useTransition } from "react";
import { createDecision } from "@/lib/actions";
import { addDaysISO } from "@/lib/dates";
import type { DecisionDraft } from "@/lib/types";

export type DraftAdvisor = { id: number; slug: string; name: string; emoji: string };
type TaskRow = { title: string; advisorId: number | null; dueDate: string };

export function DecisionDraftForm({
  meetingId,
  draft,
  advisors,
}: {
  meetingId: string;
  draft: DecisionDraft;
  advisors: DraftAdvisor[];
}) {
  const bySlug = new Map(advisors.map((a) => [a.slug, a.id]));
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [reviewDate, setReviewDate] = useState(addDaysISO(Math.max(1, draft.review_in_days || 30)));
  const [rows, setRows] = useState<TaskRow[]>(
    draft.tasks.map((t) => ({
      title: t.title,
      advisorId: bySlug.get(t.owner_slug) ?? null,
      dueDate: addDaysISO(Math.max(1, t.due_in_days || 7)),
    })),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<TaskRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createDecision({
          title,
          description,
          meetingId,
          reviewDate: reviewDate || null,
          tasks: rows.filter((r) => r.title.trim()).map((r) => ({ ...r, dueDate: r.dueDate || null })),
        });
      } catch (err) {
        // redirect() из server action пробрасывается как специальная ошибка — её не показываем
        if (!(err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) setError((err as Error).message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-ink-900">Проект решения</h3>
      <div>
        <label className="label">Решение</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Суть и условия</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" />
      </div>
      <div className="max-w-xs">
        <label className="label">Пересмотреть результат</label>
        <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Поручения</label>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-ink-50 p-2 sm:grid-cols-[1fr_180px_150px_auto]">
              <input value={r.title} onChange={(e) => update(i, { title: e.target.value })} className="input" />
              <select
                value={r.advisorId ?? ""}
                onChange={(e) => update(i, { advisorId: e.target.value ? Number(e.target.value) : null })}
                className="input"
              >
                <option value="">— куратор —</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                ))}
              </select>
              <input type="date" value={r.dueDate} onChange={(e) => update(i, { dueDate: e.target.value })} className="input" />
              <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="btn-ghost" title="Убрать">✕</button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { title: "", advisorId: null, dueDate: addDaysISO(7) }])}
          className="mt-2 text-sm text-ink-600 hover:text-ink-900"
        >
          + Добавить поручение
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={pending || !title.trim()} className="btn-primary">
        {pending ? "Сохраняю…" : "✅ Утвердить решение"}
      </button>
    </div>
  );
}
