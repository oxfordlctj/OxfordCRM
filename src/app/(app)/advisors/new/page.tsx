import Link from "next/link";
import { AdvisorForm } from "@/components/AdvisorForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Новый советник" };

export default function NewAdvisorPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/advisors" className="text-sm text-ink-500 hover:text-ink-900">← Советники</Link>
      <PageHeader title="Новый советник" subtitle="Добавьте эксперта в свой совет" />
      <AdvisorForm />
    </div>
  );
}
