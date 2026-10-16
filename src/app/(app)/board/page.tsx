import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { advisors, db, meetings } from "@/db";
import { NewMeetingForm } from "@/components/NewMeetingForm";
import { PageHeader } from "@/components/PageHeader";
import { formatDateTime } from "@/lib/dates";

export const metadata = { title: "Заседание совета" };

const STATUS: Record<string, string> = {
  pending: "ожидает",
  running: "идёт",
  done: "завершено",
  error: "прервано",
};

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [members, past] = await Promise.all([
    db
      .select({ id: advisors.id, name: advisors.name, emoji: advisors.emoji, category: advisors.category })
      .from(advisors)
      .where(and(eq(advisors.enabled, true), eq(advisors.isChair, false)))
      .orderBy(asc(advisors.sortOrder)),
    db.select().from(meetings).orderBy(desc(meetings.createdAt)).limit(30),
  ]);
  return (
    <>
      <PageHeader
        title="Заседание совета директоров"
        subtitle="Вынесите вопрос на совет: каждый советник выскажет позицию, они поспорят, а Председатель даст итоговую рекомендацию."
      />
      <NewMeetingForm advisors={members} initialQuestion={q ?? ""} />
      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">Прошлые заседания</h2>
          <div className="card divide-y divide-ink-100">
            {past.map((m) => (
              <Link key={m.id} href={`/board/${m.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-50">
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm text-ink-900">{m.question}</span>
                  <span className="text-xs text-ink-400">
                    {formatDateTime(m.createdAt)} · {m.participantIds.length} участн. · {m.mode === "full" ? "полное" : "экспресс"}
                  </span>
                </span>
                <span className={`chip ${m.status === "done" ? "bg-green-50 text-green-700" : m.status === "error" ? "bg-red-50 text-red-700" : "bg-gold-50 text-gold-600"}`}>
                  {STATUS[m.status]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
