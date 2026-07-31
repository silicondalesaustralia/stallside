"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { standOffersCard } from "@/lib/stand-payment-brands";
import { ownerHasProAccess } from "@/lib/owner-trial";

const COOKIE = "ss_card_interest";
const WINDOW_MS = 60 * 60 * 1000;

export async function recordCardInterest(input: {
  standSlug: string;
  subtotalCents: number;
  currency: string;
}) {
  const slug = input.standSlug.trim().toLowerCase();
  const subtotalCents = Math.max(0, Math.floor(input.subtotalCents));
  const currency = input.currency.trim().toUpperCase().slice(0, 3) || "AUD";

  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: {
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });
  if (!stand?.isActive) {
    return { error: "Stand not found." };
  }

  // Only when card is not offerable (Starter / Connect incomplete).
  if (
    standOffersCard(stand, stand.owner) ||
    ownerHasProAccess(stand.owner, {
      email: stand.owner.user?.email,
      role: stand.owner.user?.role,
      lifetimeAccess: stand.owner.lifetimeAccess,
    })
  ) {
    return { ok: true as const, skipped: true };
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value ?? "";
  const parts = raw.split("|").filter(Boolean);
  const recent = parts.some((p) => {
    const [sid, ts] = p.split(":");
    return sid === stand.id && Date.now() - Number(ts) < WINDOW_MS;
  });
  if (recent) {
    return { ok: true as const, skipped: true };
  }

  await prisma.cardInterest.create({
    data: {
      standId: stand.id,
      subtotalCents,
      currency,
    },
  });

  const next = [`${stand.id}:${Date.now()}`, ...parts]
    .slice(0, 20)
    .join("|");
  jar.set(COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { ok: true as const, skipped: false };
}
