import { asc } from "drizzle-orm";
import Link from "next/link";
import { advisors, db, type Advisor } from "@/db";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Советники" };

function AdvisorCard({ a }: { a: Advisor }) {
  return (
    <Link
      href={`/advisors/${a.slug}`}
      className={`card group flex gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${a.enabled ? "" : "opacity-50"}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-2xl">{a.emoji}</span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink-900 group-hover:text-gold-600">{a.name}</span>
        <span className="block text-xs font-medium text-ink-500">{a.title}</span>
        <span className="mt-1 line-clamp-2 block text-xs text-ink-500">{a.description}</span>
      </span>
    </Link>
  );
}

export default async function AdvisorsPage() {
  const all = await db.select().from(advisors).orderBy(asc(advisors.sortOrder), asc(advisors.id));
  const business = all.filter((a) => a.category === "business");
  const life = all.filter((a) => a.category === "life");
  return (
    <>
      <PageHeader
        title="Советники"
        subtitle="Выберите советника для личного разговора. Все они знают ваше досье."
        actions={<Link href="/advisors/new" className="btn-ghost">+ Добавить советника</Link>}
      />
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">Бизнес</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {business.map((a) => <AdvisorCard key={a.id} a={a} />)}
      </div>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">Жизнь</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {life.map((a) => <AdvisorCard key={a.id} a={a} />)}
      </div>
    </>
  );
}
