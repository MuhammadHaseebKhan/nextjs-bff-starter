import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  UPSTREAM_API_URL: z.url(),
  UPSTREAM_API_KEY: z.string().min(1),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Validated server-only configuration.
 *
 * Parsed lazily (on first request, not at import time) so `next build` works without
 * runtime secrets, and fails loudly with every invalid key listed instead of
 * surfacing as an `undefined` header deep inside a request.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${issues}\nSee .env.example.`);
  }

  cached = result.data;
  return cached;
}
