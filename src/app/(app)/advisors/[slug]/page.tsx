import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { advisors, db } from "@/db";
import { ChatLayout } from "@/components/ChatLayout";

export default async function AdvisorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [advisor] = await db.select().from(advisors).where(eq(advisors.slug, slug));
  if (!advisor) notFound();
  return <ChatLayout advisor={advisor} conversationId={null} initialMessages={[]} />;
}
