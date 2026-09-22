import crypto from "node:crypto";

export function newUnsubToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** Signed unsubscribe payload — email may contain `.`, so never split on it. */
export function signUnsubLink(ownerId: string, email: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev";
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
  const body = JSON.stringify({
    o: ownerId,
    e: email.trim().toLowerCase(),
    x: exp,
  });
  const sig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")
    .slice(0, 32);
  return Buffer.from(`${body}.${sig}`).toString("base64url");
}

export function verifyUnsubLink(
  token: string,
): { ownerId: string; email: string } | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const dot = raw.lastIndexOf(".");
    if (dot <= 0) return null;
    const body = raw.slice(0, dot);
    const sig = raw.slice(dot + 1);
    const secret = process.env.AUTH_SECRET ?? "dev";
    const expect = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex")
      .slice(0, 32);
    if (expect !== sig) return null;
    const parsed = JSON.parse(body) as { o?: string; e?: string; x?: number };
    if (!parsed.o || !parsed.e || typeof parsed.x !== "number") return null;
    if (parsed.x * 1000 < Date.now()) return null;
    return { ownerId: parsed.o, email: parsed.e };
  } catch {
    return null;
  }
}
