export type ImageApiUsage = { inputTokens: number; outputTokens: number };
export type RawImageUsage = { input_tokens?: number; output_tokens?: number } | undefined;

/** Combined usage across image calls; null when any call did not report it. */
export function sumImageUsage(parts: RawImageUsage[]): ImageApiUsage | null {
  if (parts.some((p) => !p)) return null;
  return parts.reduce<ImageApiUsage>(
    (acc, p) => ({ inputTokens: acc.inputTokens + (p?.input_tokens ?? 0), outputTokens: acc.outputTokens + (p?.output_tokens ?? 0) }),
    { inputTokens: 0, outputTokens: 0 },
  );
}
