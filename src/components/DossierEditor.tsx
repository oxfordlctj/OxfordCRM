"use client";

import { useState, useTransition } from "react";
import { saveDossierSection } from "@/lib/actions";

export function DossierEditor({ sectionKey, title, hint, content }: { sectionKey: string; title: string; hint: string; content: string }) {
  const [value, setValue] = useState(content);
  const [saved, setSaved] = useState(content);
  const [pending, startTransition] = useTransition();
  const dirty = value !== saved;

  function save() {
    const fd = new FormData();
    fd.set("key", sectionKey);
    fd.set("content", value);
    startTransition(async () => {
      await saveDossierSection(fd);
      setSaved(value);
    });
  }

  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-semibold text-ink-900">{title}</h2>
        {!saved.trim() && <span className="chip bg-gold-50 text-gold-600">не заполнено</span>}
        <span className="ml-auto text-xs text-ink-400">{pending ? "Сохраняю…" : dirty ? "Есть изменения" : saved.trim() ? "Сохранено" : ""}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => dirty && save()}
        rows={Math.min(14, Math.max(3, value.split("\n").length + 1))}
        placeholder={hint}
        className="input leading-relaxed"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-ink-400">{hint}</p>
        <button onClick={save} disabled={!dirty || pending} className="btn-ghost shrink-0 py-1">Сохранить</button>
      </div>
    </section>
  );
}
