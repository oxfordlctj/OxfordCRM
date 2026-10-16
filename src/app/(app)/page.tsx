import { and, asc, desc, eq, lte } from "drizzle-orm";
import Link from "next/link";
import { advisors, conversations, db, decisions, dossierSections, meetings } from "@/db";
import { TaskItem } from "@/components/TaskItem";
import { addDaysISO, formatDate, formatDateTime } from "@/lib/dates";
import { listTasks } from "@/lib/queries";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Dushanbe" }).format(new Date()));
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export default async function Dashboard() {
  const [openTasks, reviews, recentMeetings, recentChats, sections, team] = await Promise.all([
    listTasks(true),
    db
      .select()
      .from(decisions)
      .where(and(eq(decisions.status, "active"), lte(decisions.reviewDate, addDaysISO(7))))
      .orderBy(asc(decisions.reviewDate)),
    db.select().from(meetings).orderBy(desc(meetings.createdAt)).limit(5),
    db
      .select({ id: conversations.id, title: conversations.title, updatedAt: conversations.updatedAt, emoji: advisors.emoji, name: advisors.name })
      .from(conversations)
      .innerJoin(advisors, eq(conversations.advisorId, advisors.id))
      .orderBy(desc(conversations.updatedAt))
      .limit(5),
    db.select({ title: dossierSections.title, content: dossierSections.content }).from(dossierSections),
    db
      .select({ slug: advisors.slug, name: advisors.name, emoji: advisors.emoji })
      .from(advisors)
      .where(eq(advisors.enabled, true))
      .orderBy(asc(advisors.sortOrder)),
  ]);
  const filled = sections.filter((s) => s.content.trim()).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-ink-950 p-6 text-white md:p-8">
        <p className="text-sm text-gold-300">{greeting()}!</p>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Что вынесем на совет сегодня?</h1>
        <form action="/board" method="get" className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            required
            placeholder="Опишите вопрос или решение, которое нужно принять…"
            className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-ink-400 focus:border-gold-400 focus:outline-none"
          />
          <button className="btn-gold shrink-0 py-3">🏛️ К совету</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {team.map((a) => (
            <Link
              key={a.slug}
              href={`/advisors/${a.slug}`}
              title={a.name}
              className="flex items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1 text-xs text-ink-100 hover:bg-ink-700"
            >
              <span>{a.emoji}</span>
              <span className="hidden sm:inline">{a.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {filled < sections.length && (
        <Link href="/dossier" className="card flex items-center gap-4 p-4 hover:shadow-md">
          <span className="text-2xl">🗂️</span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-ink-900">
              Досье заполнено на {filled} из {sections.length} разделов
            </span>
            <span className="block text-xs text-ink-500">Чем больше советники знают о вас, тем точнее их советы. Заполните досье →</span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink-100">
              <span className="block h-full bg-gold-400" style={{ width: `${(filled / Math.max(1, sections.length)) * 100}%` }} />
            </span>
          </span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Открытые поручения</h2>
            <Link href="/decisions" className="text-xs text-gold-600 hover:underline">Все →</Link>
          </div>
          <div className="divide-y divide-ink-50">
            {openTasks.slice(0, 7).map((t) => <TaskItem key={t.id} task={t} showDecision />)}
          </div>
          {openTasks.length === 0 && <p className="text-sm text-ink-400">Нет открытых поручений</p>}
        </section>

        <section className="card p-5">
          <h2 className="mb-2 font-semibold text-ink-900">Решения на пересмотр</h2>
          {reviews.length === 0 && <p className="text-sm text-ink-400">Ближайшую неделю пересматривать нечего</p>}
          <ul className="divide-y divide-ink-50">
            {reviews.map((d) => (
              <li key={d.id} className="py-2">
                <Link href="/decisions" className="text-sm text-ink-900 hover:text-gold-600">{d.title}</Link>
                <p className="text-xs text-ink-400">пересмотр {formatDate(d.reviewDate)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Последние заседания</h2>
            <Link href="/board" className="text-xs text-gold-600 hover:underline">Новое →</Link>
          </div>
          {recentMeetings.length === 0 && <p className="text-sm text-ink-400">Заседаний ещё не было</p>}
          <ul className="divide-y divide-ink-50">
            {recentMeetings.map((m) => (
              <li key={m.id} className="py-2">
                <Link href={`/board/${m.id}`} className="line-clamp-1 text-sm text-ink-900 hover:text-gold-600">{m.question}</Link>
                <p className="text-xs text-ink-400">{formatDateTime(m.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Последние разговоры</h2>
            <Link href="/advisors" className="text-xs text-gold-600 hover:underline">Советники →</Link>
          </div>
          {recentChats.length === 0 && <p className="text-sm text-ink-400">Начните разговор с любым советником</p>}
          <ul className="divide-y divide-ink-50">
            {recentChats.map((c) => (
              <li key={c.id} className="py-2">
                <Link href={`/chat/${c.id}`} className="line-clamp-1 text-sm text-ink-900 hover:text-gold-600">
                  {c.emoji} {c.title}
                </Link>
                <p className="text-xs text-ink-400">{c.name} · {formatDateTime(c.updatedAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
