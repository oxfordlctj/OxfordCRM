/** Поток NDJSON-событий от сервера к клиенту (одно JSON-событие на строку). */
export function ndjsonResponse(
  run: (send: (event: Record<string, unknown>) => void, signal: AbortSignal) => Promise<void>,
  headers: Record<string, string> = {},
) {
  const encoder = new TextEncoder();
  const abort = new AbortController();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        await run(send, abort.signal);
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // поток уже закрыт клиентом
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      ...headers,
    },
  });
}
