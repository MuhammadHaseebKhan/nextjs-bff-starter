import "server-only";

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const SENSITIVE_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|session|email|phone/i;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const MAX_DEPTH = 5;

/**
 * Removes PII and credentials before anything is written to logs.
 * Keys are redacted by name; email addresses are masked wherever they appear in strings.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[Truncated]";
  if (typeof value === "string") return value.replace(EMAIL, "[email]");
  if (value instanceof Error) {
    return { name: value.name, message: redact(value.message, depth + 1), cause: redact(value.cause, depth + 1) };
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [key, SENSITIVE_KEY.test(key) ? "[Redacted]" : redact(field, depth + 1)]),
    );
  }
  return value;
}

function write(level: Level, message: string, fields: Fields = {}) {
  // One JSON object per line: what Cloud Run, Vercel and most log pipelines parse natively.
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...(redact(fields) as Fields) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (message: string, fields?: Fields) => write("debug", message, fields),
  info: (message: string, fields?: Fields) => write("info", message, fields),
  warn: (message: string, fields?: Fields) => write("warn", message, fields),
  error: (message: string, fields?: Fields) => write("error", message, fields),
};
