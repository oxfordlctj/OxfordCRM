import { asc, desc } from "drizzle-orm";
import { db, dossierSections, memoryFacts } from "@/db";
import { DeleteFact } from "@/components/DeleteFact";
import { DossierEditor } from "@/components/DossierEditor";
import { PageHeader } from "@/components/PageHeader";
import { addMemoryFact } from "@/lib/actions";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Досье" };

export default async function DossierPage() {
  const [sections, facts] = await Promise.all([
    db.select().from(dossierSections).orderBy(asc(dossierSections.sortOrder)),
    db.select().from(memoryFacts).orderBy(desc(memoryFacts.createdAt)),
  ]);
  const titles = new Map(sections.map((s) => [s.key, s.title]));
  return (
    <>
      <PageHeader
        title="Досье"
        subtitle="Всё, что знают о вас советники. Чем подробнее досье, тем точнее советы. Сохраняется автоматически."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {sections.map((s) => (
            <DossierEditor key={s.key} sectionKey={s.key} title={s.title} hint={s.hint} content={s.content} />
          ))}
        </div>
        <aside className="card h-fit p-5 lg:sticky lg:top-8">
          <h2 className="font-semibold text-ink-900">🧠 Память совета</h2>
          <p className="mb-3 text-xs text-ink-500">
            Факты из разговоров. Добавляются кнопкой «Запомнить» в чате или вручную.
          </p>
          <form action={addMemoryFact} className="mb-3 space-y-2">
            <textarea name="content" required rows={2} placeholder="Например: В филиале на Рудаки 120 студентов" className="input" />
            <div className="flex gap-2">
              <select name="category" className="input">
                {sections.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                <option value="other">Другое</option>
              </select>
              <button className="btn-primary shrink-0">Добавить</button>
            </div>
          </form>
          <ul className="divide-y divide-ink-50">
            {facts.map((f) => (
              <li key={f.id} className="flex items-start gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-800">{f.content}</p>
                  <p className="text-xs text-ink-400">{titles.get(f.category) ?? "Другое"} · {formatDate(f.createdAt)}</p>
                </div>
                <DeleteFact id={f.id} />
              </li>
            ))}
          </ul>
          {facts.length === 0 && <p className="text-sm text-ink-400">Пока пусто</p>}
        </aside>
      </div>
    </>
  );
}
