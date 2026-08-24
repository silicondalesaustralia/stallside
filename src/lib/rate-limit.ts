import crypto from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

function identifierFor(bucket: string) {
  return `rl:${bucket}`;
}

export async function rateLimitCount(bucket: string): Promise<number> {
  const identifier = identifierFor(bucket);
  const now = new Date();
  await prisma.verificationToken.deleteMany({
    where: { identifier, expires: { lt: now } },
  });
  return prisma.verificationToken.count({
    where: { identifier, expires: { gt: now } },
  });
}

export async function bumpRateLimit(opts: {
  bucket: string;
  windowMs: number;
}): Promise<void> {
  const identifier = identifierFor(opts.bucket);
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: `rl:${opts.bucket}:${crypto.randomBytes(16).toString("hex")}`,
      expires: new Date(Date.now() + opts.windowMs),
    },
  });
}

/** Sliding window via VerificationToken rows (works on serverless). */
export async function assertRateLimit(opts: {
  bucket: string;
  limit: number;
  windowMs: number;
}): Promise<void> {
  const count = await rateLimitCount(opts.bucket);
  if (count >= opts.limit) {
    throw new RateLimitError();
  }
  await bumpRateLimit({ bucket: opts.bucket, windowMs: opts.windowMs });
}

export class RateLimitError extends Error {
  constructor(message = "Too many attempts. Try again in a few minutes.") {
    super(message);
    this.name = "RateLimitError";
  }
}

export async function clientIpFromHeaders(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export async function clearRateLimitBucket(bucket: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: identifierFor(bucket) },
  });
}
