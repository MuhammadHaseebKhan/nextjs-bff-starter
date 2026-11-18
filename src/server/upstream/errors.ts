export type UpstreamErrorKind =
  | "timeout"
  | "network"
  | "unauthorized"
  | "not_found"
  | "bad_response"
  | "upstream_error";

/** A failure talking to the upstream API, classified so the BFF can map it to a client-safe response. */
export class UpstreamError extends Error {
  constructor(
    readonly kind: UpstreamErrorKind,
    message: string,
    readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "UpstreamError";
  }
}

export function classifyStatus(status: number): UpstreamErrorKind {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not_found";
  return "upstream_error";
}
