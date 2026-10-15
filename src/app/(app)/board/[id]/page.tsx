import { asc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { advisors, db, decisions, meetings, meetingTurns } from "@/db";
import { DeleteMeeting } from "@/components/DeleteMeeting";
import { MeetingClient } from "@/components/MeetingClient";
import { getChair } from "@/lib/context";
import { formatDateTime } from "@/lib/dates";

export const metadata = { title: "Заседание" };

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
  if (!meeting) notFound();

  const [members, chair, turns, all, [decision]] = await Promise.all([
    meeting.participantIds.length
      ? db.select().from(advisors).where(inArray(advisors.id, meeting.participantIds))
      : Promise.resolve([]),
    getChair(),
    db
      .select({ advisorId: meetingTurns.advisorId, round: meetingTurns.round, content: meetingTurns.content })
      .from(meetingTurns)
      .where(eq(meetingTurns.meetingId, id))
      .orderBy(asc(meetingTurns.id)),
    db
      .select({ id: advisors.id, slug: advisors.slug, name: advisors.name, emoji: advisors.emoji })
      .from(advisors)
      .orderBy(asc(advisors.sortOrder)),
    db.select({ id: decisions.id }).from(decisions).where(eq(decisions.meetingId, id)).limit(1),
  ]);
  const order = new Map(meeting.participantIds.map((pid, i) => [pid, i]));
  members.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  const person = (a: { id: number; name: string; emoji: string; title: string }) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    title: a.title,
  });

  return (
    <>
      <Link href="/board" className="text-sm text-ink-500 hover:text-ink-900">← Все заседания</Link>
      <header className="mt-2 mb-6 rounded-2xl bg-ink-950 p-5 text-white">
        <p className="text-xs tracking-wide text-gold-300 uppercase">
          Заседание · {formatDateTime(meeting.createdAt)} · {meeting.mode === "full" ? "полное" : "экспресс"}
        </p>
        <h1 className="mt-2 text-lg font-semibold whitespace-pre-wrap md:text-xl">{meeting.question}</h1>
        {meeting.context && <p className="mt-2 text-sm whitespace-pre-wrap text-ink-300">{meeting.context}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {members.map((m) => (
            <span key={m.id} className="chip bg-ink-800 text-ink-100">{m.emoji} {m.name}</span>
          ))}
        </div>
      </header>
      <MeetingClient
        meetingId={meeting.id}
        mode={meeting.mode}
        initialStatus={meeting.status}
        participants={members.map(person)}
        chair={chair ? person(chair) : null}
        initialTurns={turns}
        taskAdvisors={all}
        decisionId={decision?.id ?? null}
      />
      <div className="mt-10 flex justify-end">
        <DeleteMeeting id={meeting.id} />
      </div>
    </>
  );
}
