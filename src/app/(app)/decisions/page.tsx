import { asc, desc } from "drizzle-orm";
import Link from "next/link";
import { advisors, db, decisions } from "@/db";
import { DeleteDecision } from "@/components/DeleteDecision";
import { PageHeader } from "@/components/PageHeader";
import { TaskItem } from "@/components/TaskItem";
import { addTask, quickDecision, updateDecision } from "@/lib/actions";
import { formatDate, isOverdue } from "@/lib/dates";
import { listTasks } from "@/lib/queries";

export const metadata = { title: "Решения и поручения" };

export default async function DecisionsPage() {
  const [all, taskRows, advisorList] = await Promise.all([
    db.select().from(decisions).orderBy(desc(decisions.createdAt)),
    listTasks(false),
    db.select({ id: advisors.id, name: advisors.name, emoji: advisors.emoji }).from(advisors).orderBy(asc(advisors.sortOrder)),
  ]);
  const active = all.filter((d) => d.status === "active");
  const closed = all.filter((d) => d.status !== "active");
  const openTasks = taskRows.filter((t) => t.status === "open");

  return (
    <>
      <PageHeader title="Решения и поручения" subtitle="Журнал решений совета и контроль исполнения." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-medium text-ink-700">+ Записать решение вручную</summary>
            <form action={quickDecision} className="mt-3 space-y-3">
              <input name="title" required placeholder="Что решили" className="input" />
              <textarea name="description" rows={2} placeholder="Подробности (необязательно)" className="input" />
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm text-ink-600">
                  Пересмотреть
                  <input type="date" name="reviewDate" className="input mt-1" />
                </label>
                <button className="btn-primary">Сохранить</button>
              </div>
            </form>
          </details>

          {active.length === 0 && (
            <div className="card p-6 text-center text-sm text-ink-500">
              Действующих решений пока нет. <Link href="/board" className="text-gold-600 hover:underline">Созовите совет</Link>, чтобы принять первое.
            </div>
          )}

          {active.map((d) => {
            const dTasks = taskRows.filter((t) => t.decisionId === d.id);
            const progress = dTasks.length ? Math.round((dTasks.filter((t) => t.status === "done").length / dTasks.length) * 100) : 0;
            return (
              <article key={d.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold text-ink-900">{d.title}</h2>
                  {d.reviewDate && (
                    <span className={`chip ${isOverdue(d.reviewDate) ? "bg-red-50 text-red-700" : "bg-ink-50 text-ink-600"}`}>
                      пересмотр {formatDate(d.reviewDate)}
                    </span>
                  )}
                </div>
                {d.description && <p className="mt-1 text-sm whitespace-pre-wrap text-ink-600">{d.description}</p>}
                {d.meetingId && (
                  <Link href={`/board/${d.meetingId}`} className="mt-1 inline-block text-xs text-gold-600 hover:underline">
                    Протокол заседания →
                  </Link>
                )}
                {dTasks.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full bg-gold-400" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="divide-y divide-ink-50">
                      {dTasks.map((t) => <TaskItem key={t.id} task={t} />)}
                    </div>
                  </div>
                )}
                <form action={addTask} className="mt-2 flex flex-wrap gap-2">
                  <input type="hidden" name="decisionId" value={d.id} />
                  <input name="title" required placeholder="Новое поручение" className="input min-w-40 flex-1" />
                  <select name="advisorId" className="input w-auto">
                    <option value="">куратор</option>
                    {advisorList.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                  </select>
                  <input type="date" name="dueDate" className="input w-auto" />
                  <button className="btn-ghost">Добавить</button>
                </form>
                <details className="mt-3 border-t border-ink-100 pt-3">
                  <summary className="cursor-pointer text-xs text-ink-500">Закрыть решение / записать результат</summary>
                  <form action={updateDecision} className="mt-2 space-y-2">
                    <input type="hidden" name="id" value={d.id} />
                    <textarea name="outcome" defaultValue={d.outcome} rows={2} placeholder="Чем закончилось? Что узнали?" className="input" />
                    <div className="flex flex-wrap items-center gap-2">
                      <select name="status" defaultValue="done" className="input w-auto">
                        <option value="done">Выполнено</option>
                        <option value="cancelled">Отменено</option>
                        <option value="active">Оставить действующим</option>
                      </select>
                      <button className="btn-primary">Сохранить</button>
                      <DeleteDecision id={d.id} />
                    </div>
                  </form>
                </details>
              </article>
            );
          })}

          {closed.length > 0 && (
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-medium text-ink-700">Архив решений ({closed.length})</summary>
              <div className="mt-3 divide-y divide-ink-100">
                {closed.map((d) => (
                  <div key={d.id} className="py-2">
                    <p className="text-sm text-ink-800">
                      {d.status === "done" ? "✅" : "✖️"} {d.title}
                    </p>
                    {d.outcome && <p className="text-xs whitespace-pre-wrap text-ink-500">{d.outcome}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-8">
          <h2 className="font-semibold text-ink-900">Все открытые поручения</h2>
          <p className="mb-2 text-xs text-ink-500">{openTasks.length} шт., по сроку</p>
          <div className="divide-y divide-ink-50">
            {openTasks.map((t) => <TaskItem key={t.id} task={t} showDecision />)}
          </div>
          {openTasks.length === 0 && <p className="text-sm text-ink-400">Всё выполнено 🎉</p>}
          <form action={addTask} className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
            <input name="title" required placeholder="Личное поручение" className="input" />
            <button className="btn-ghost shrink-0">+</button>
          </form>
        </aside>
      </div>
    </>
  );
}
