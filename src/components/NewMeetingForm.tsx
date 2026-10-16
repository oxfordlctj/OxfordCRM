"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createMeeting } from "@/lib/actions";

type A = { id: number; name: string; emoji: string; category: "business" | "life" };

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-gold" disabled={disabled || pending}>
      {pending ? "Созываю…" : "🏛️ Созвать совет"}
    </button>
  );
}

export function NewMeetingForm({ advisors, initialQuestion = "" }: { advisors: A[]; initialQuestion?: string }) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(advisors.filter((a) => a.category === "business").map((a) => a.id)),
  );
  const [question, setQuestion] = useState(initialQuestion);
  const pick = (ids: number[]) => setSelected(new Set(ids));
  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <form action={createMeeting} className="card space-y-5 p-5">
      <div>
        <label className="label" htmlFor="question">Вопрос на заседание</label>
        <textarea
          id="question"
          name="question"
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input"
          placeholder="Например: Открывать ли 8-й филиал в районе Сино или вложить эти деньги в онлайн-школу?"
        />
      </div>
      <div>
        <label className="label" htmlFor="context">Контекст и цифры (необязательно)</label>
        <textarea
          id="context"
          name="context"
          rows={3}
          className="input"
          placeholder="Бюджет, сроки, данные, ограничения — всё, что поможет совету"
        />
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="label mb-0">Участники</span>
          <button type="button" onClick={() => pick(advisors.filter((a) => a.category === "business").map((a) => a.id))} className="chip bg-ink-100 text-ink-700 hover:bg-ink-200">Бизнес-совет</button>
          <button type="button" onClick={() => pick(advisors.filter((a) => a.category === "life").map((a) => a.id))} className="chip bg-ink-100 text-ink-700 hover:bg-ink-200">Личный совет</button>
          <button type="button" onClick={() => pick(advisors.map((a) => a.id))} className="chip bg-ink-100 text-ink-700 hover:bg-ink-200">Все</button>
          <button type="button" onClick={() => pick([])} className="chip text-ink-500 hover:bg-ink-100">Сбросить</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {advisors.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition ${
                selected.has(a.id) ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
              }`}
            >
              <input type="checkbox" name="participants" value={a.id} checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="sr-only" />
              <span>{a.emoji}</span>
              {a.name}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-400">Председатель участвует всегда и подводит итог. Выбрано: {selected.size}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex gap-4 text-sm text-ink-700">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="mode" value="full" defaultChecked className="accent-ink-900" />
            Полное заседание <span className="text-ink-400">(позиции → дебаты → итог)</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="mode" value="express" className="accent-ink-900" />
            Экспресс <span className="text-ink-400">(без дебатов)</span>
          </label>
        </fieldset>
        <Submit disabled={selected.size === 0 || !question.trim()} />
      </div>
    </form>
  );
}
