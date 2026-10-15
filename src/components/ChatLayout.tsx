import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { conversations, db, type Advisor } from "@/db";
import { formatDateTime } from "@/lib/dates";
import { ChatClient } from "./ChatClient";
import { DeleteConversation } from "./DeleteConversation";

export async function ChatLayout({
  advisor,
  conversationId,
  initialMessages,
}: {
  advisor: Advisor;
  conversationId: string | null;
  initialMessages: { role: "user" | "assistant"; content: string }[];
}) {
  const history = await db
    .select()
    .from(conversations)
    .where(eq(conversations.advisorId, advisor.id))
    .orderBy(desc(conversations.updatedAt))
    .limit(50);

  return (
    <div className="-my-2 grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="hidden flex-col gap-2 md:flex md:h-[calc(100dvh-4rem)]">
        <Link href={`/advisors/${advisor.slug}`} className="btn-primary w-full">+ Новый разговор</Link>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {history.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className={`block rounded-xl px-3 py-2 text-sm ${
                c.id === conversationId ? "bg-white shadow-sm ring-1 ring-ink-100" : "hover:bg-white"
              }`}
            >
              <span className="line-clamp-2 text-ink-800">{c.title}</span>
              <span className="text-xs text-ink-400">{formatDateTime(c.updatedAt)}</span>
            </Link>
          ))}
          {history.length === 0 && <p className="px-3 text-xs text-ink-400">Разговоров пока нет</p>}
        </div>
        <div className="flex gap-2 text-xs">
          <Link href={`/advisors/${advisor.slug}/settings`} className="text-ink-500 hover:text-ink-900">⚙ Настроить советника</Link>
          {conversationId && <DeleteConversation id={conversationId} slug={advisor.slug} />}
        </div>
      </aside>
      <div className="min-w-0">
        <div className="mb-2 flex gap-3 text-xs md:hidden">
          <Link href="/advisors" className="text-ink-500">← Советники</Link>
          {conversationId && <Link href={`/advisors/${advisor.slug}`} className="text-ink-500">+ Новый разговор</Link>}
          {history.length > 0 && !conversationId && (
            <details className="relative">
              <summary className="cursor-pointer text-ink-500">История ({history.length})</summary>
              <div className="card absolute z-20 mt-1 max-h-72 w-72 overflow-y-auto p-2">
                {history.map((c) => (
                  <Link key={c.id} href={`/chat/${c.id}`} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-ink-50">
                    {c.title}
                  </Link>
                ))}
              </div>
            </details>
          )}
        </div>
        <ChatClient
          key={conversationId ?? "new"}
          advisor={{
            slug: advisor.slug,
            name: advisor.name,
            title: advisor.title,
            emoji: advisor.emoji,
            description: advisor.description,
          }}
          conversationId={conversationId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
