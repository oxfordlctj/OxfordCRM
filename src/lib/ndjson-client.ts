/** Читает NDJSON-поток и вызывает onEvent для каждого события. */
export async function readNdjson<T = Record<string, unknown>>(res: Response, onEvent: (event: T) => void) {
  if (!res.ok || !res.body) {
    let message = `Ошибка ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line) onEvent(JSON.parse(line) as T);
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as T);
}
