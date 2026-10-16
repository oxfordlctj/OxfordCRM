import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { advisors, db, meetings, meetingTurns, type Advisor } from "@/db";
import { describeError, streamReply } from "@/lib/claude";
import { buildOwnerContext, buildSystemPrompt, getChair } from "@/lib/context";
import { ndjsonResponse } from "@/lib/ndjson";

export const maxDuration = 300;

const MEETING_RULES = `# Формат: заседание совета директоров
Владелец вынес вопрос на заседание. В нём участвуют несколько советников, каждый со своей позиции. Отвечай строго от лица своей роли и в рамках своей экспертизы — не пытайся охватить всё, это сделают коллеги.`;

const ROUND1 = `Раунд 1 — ваша позиция. Ответ: 150–250 слов, Markdown.
Структура:
**Позиция:** одно предложение — что вы рекомендуете.
**Аргументы:** 2–4 пункта с вашей точки зрения (цифры, если возможно).
**Риски:** главное, что может пойти не так.
**Предложение:** конкретный первый шаг.`;

const ROUND2 = `Раунд 2 — дебаты. Ниже позиции всех членов совета. Ответ: 80–150 слов, Markdown.
- С кем вы не согласны и почему (называйте коллег по роли).
- Что коллеги упустили с точки зрения вашей экспертизы.
- Изменилась ли ваша позиция? Итоговая позиция одним предложением.
Не повторяйте свой первый ответ.`;

const CHAIR_TASK = `Подведите итог заседания как Председатель. Markdown, 300–500 слов, структура:
## Рекомендация совета
Одна чёткая рекомендация (2–3 предложения).
## Почему
Ключевые аргументы, на которых держится решение.
## Где совет разошёлся
Суть разногласий и как вы их разрешили.
## Риски и как их снизить
## План действий
Нумерованный список: что сделать, кто отвечает (роль), срок.
## Что уточнить
Каких данных не хватает и при каких условиях решение стоит пересмотреть.`;

type Send = (event: Record<string, unknown>) => void;
type SpeakRequest = {
  system: string;
  messages: { role: "user"; content: string }[];
  effort: "medium" | "high";
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // force=1 — перезапуск зависшего заседания (например, вкладку закрыли во время прогона)
  const force = new URL(req.url).searchParams.get("force") === "1";
  const claimable: ("pending" | "error" | "running")[] = force ? ["pending", "error", "running"] : ["pending", "error"];
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
  if (!meeting) return NextResponse.json({ error: "Заседание не найдено" }, { status: 404 });

  // Атомарно занимаем заседание, чтобы не запустить его дважды
  const claimed = await db
    .update(meetings)
    .set({ status: "running" })
    .where(and(eq(meetings.id, id), inArray(meetings.status, claimable)))
    .returning();
  if (!claimed.length) {
    return NextResponse.json({ error: "Заседание уже идёт или завершено" }, { status: 409 });
  }
  await db.delete(meetingTurns).where(eq(meetingTurns.meetingId, id));

  const members = await db.select().from(advisors).where(inArray(advisors.id, meeting.participantIds));
  const order = new Map(meeting.participantIds.map((pid, i) => [pid, i]));
  members.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  const chair = await getChair();
  const ownerContext = await buildOwnerContext();

  const question = [
    `## Вопрос на заседание\n${meeting.question}`,
    meeting.context.trim() ? `## Дополнительный контекст\n${meeting.context.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return ndjsonResponse(async (send, signal) => {
    try {
      // Раунд 1: позиции — параллельно
      const round1 = await runRound(1, members, send, signal, (a) =>
        speak(a, `${question}\n\n${ROUND1}`),
      );
      const positions = formatTurns(members, round1);

      // Раунд 2: дебаты (только в полном режиме)
      let debates = "";
      if (meeting.mode === "full" && members.length > 1) {
        const round2 = await runRound(2, members, send, signal, (a) =>
          speak(a, `${question}\n\n# Позиции членов совета (раунд 1)\n${positions}\n\n${ROUND2}`),
        );
        debates = formatTurns(members, round2);
      }

      // Раунд 3: итог Председателя
      if (chair) {
        const transcript = [
          `# Позиции (раунд 1)\n${positions}`,
          debates ? `# Дебаты (раунд 2)\n${debates}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
        await runRound(3, [chair], send, signal, (a) =>
          speak(a, `${question}\n\n${transcript}\n\n${CHAIR_TASK}`, "high"),
        );
      }

      await db.update(meetings).set({ status: "done" }).where(eq(meetings.id, id));
      send({ type: "done" });
    } catch (err) {
      await db.update(meetings).set({ status: "error" }).where(eq(meetings.id, id));
      send({ type: "error", message: describeError(err) });
    }

    function speak(advisor: Advisor, prompt: string, effort: "medium" | "high" = "medium"): SpeakRequest {
      return {
        system: buildSystemPrompt(advisor, ownerContext, MEETING_RULES),
        messages: [{ role: "user" as const, content: prompt }],
        effort,
      };
    }
  });

  async function runRound(
    round: number,
    speakers: Advisor[],
    send: Send,
    signal: AbortSignal,
    build: (a: Advisor) => SpeakRequest,
  ) {
    send({ type: "round", round });
    const results = await Promise.all(
      speakers.map(async (advisor) => {
        send({ type: "turn_start", round, advisorId: advisor.id });
        const req = build(advisor);
        const text = await streamReply({
          ...req,
          signal,
          onText: (delta) => send({ type: "delta", round, advisorId: advisor.id, text: delta }),
        });
        await db.insert(meetingTurns).values({ meetingId: id, advisorId: advisor.id, round, content: text });
        send({ type: "turn_end", round, advisorId: advisor.id });
        return [advisor.id, text] as const;
      }),
    );
    return new Map(results);
  }
}

function formatTurns(members: Advisor[], turns: Map<number, string>) {
  return members
    .map((m) => `### ${m.name} (${m.title})\n${turns.get(m.id) ?? ""}`)
    .join("\n\n");
}
