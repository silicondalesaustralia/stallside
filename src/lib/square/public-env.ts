/** Client-safe Square env (no secrets). */
export function squareEnvironment(): "sandbox" | "production" {
  const raw = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ??
    process.env.SQUARE_ENVIRONMENT ??
    "sandbox")
    .trim()
    .toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}
