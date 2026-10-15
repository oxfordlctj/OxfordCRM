import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { advisors, db } from "@/db";
import { AdvisorForm } from "@/components/AdvisorForm";
import { PageHeader } from "@/components/PageHeader";

export default async function AdvisorSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [advisor] = await db.select().from(advisors).where(eq(advisors.slug, slug));
  if (!advisor) notFound();
  return (
    <div className="max-w-3xl">
      <Link href={`/advisors/${slug}`} className="text-sm text-ink-500 hover:text-ink-900">← К разговору</Link>
      <PageHeader title={`${advisor.emoji} ${advisor.name}`} subtitle="Настройка советника" />
      <AdvisorForm advisor={advisor} />
    </div>
  );
}
