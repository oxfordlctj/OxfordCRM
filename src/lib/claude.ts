import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export class ClaudeConfigError extends Error {}

const isMock = () => process.env.CLAUDE_MOCK === "1";

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw new ClaudeConfigError(
      "Не задан ANTHROPIC_API_KEY. Добавьте ключ Claude API в переменные окружения.",
    );
  }
  client ??= new Anthropic();
  return client;
}

/** Серверный fallback при отказе модели. У Haiku его нет. */
function fallbackParams() {
  if (MODEL.startsWith("claude-haiku")) return {};
  return {
    betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[],
    fallbacks: "default" as const,
  };
}

const REFUSAL_NOTE =
  "\n\n_Советник не смог ответить на этот запрос. Попробуйте переформулировать вопрос._";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export interface StreamOptions {
  system: string;
  messages: ChatTurn[];
  effort?: Effort;
  onText: (delta: string) => void;
  signal?: AbortSignal;
}

/** Потоковый ответ советника. Возвращает полный текст. */
export async function streamReply({ system, messages, effort = "medium", onText, signal }: StreamOptions) {
  if (isMock()) return mockStream(messages, onText);

  const stream = getClient().beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 64000,
      ...fallbackParams(),
      output_config: { effort },
      cache_control: { type: "ephemeral" },
      system,
      messages,
    },
    { signal },
  );

  let text = "";
  stream.on("text", (delta) => {
    text += delta;
    onText(delta);
  });
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    onText(REFUSAL_NOTE);
    text += REFUSAL_NOTE;
  }
  return text;
}

/** Структурированный ответ по JSON-схеме. */
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  effort?: Effort;
  mock: T;
}): Promise<T> {
  if (isMock()) return opts.mock;

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    ...fallbackParams(),
    output_config: {
      effort: opts.effort ?? "medium",
      format: { type: "json_schema", schema: opts.schema },
    },
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Модель отказалась обработать запрос");
  }
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Пустой ответ модели");
  return JSON.parse(block.text) as T;
}

export function describeError(err: unknown): string {
  if (err instanceof ClaudeConfigError) return err.message;
  if (err instanceof Anthropic.AuthenticationError) return "Неверный ключ Claude API (ANTHROPIC_API_KEY).";
  if (err instanceof Anthropic.RateLimitError) return "Слишком много запросов к Claude. Подождите минуту и повторите.";
  if (err instanceof Anthropic.BadRequestError) return `Ошибка запроса к Claude: ${err.message}`;
  if (err instanceof Anthropic.APIError) return `Ошибка Claude API (${err.status ?? "сеть"}): ${err.message}`;
  if (err instanceof Error) return err.message;
  return "Неизвестная ошибка";
}

async function mockStream(messages: ChatTurn[], onText: (d: string) => void) {
  const last = (messages[messages.length - 1]?.content ?? "").replace(/[#*]/g, "").trim().split("\n")[0];
  const text = `**Тестовый режим.** Это ответ-заглушка (CLAUDE_MOCK=1).\n\nВы спросили: «${last.slice(0, 120)}»\n\n1. Первый вывод\n2. Второй вывод\n3. Следующий шаг`;
  for (const word of text.split(/(\s+)/)) {
    onText(word);
    await new Promise((r) => setTimeout(r, 8));
  }
  return text;
}
