import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Owner, Role } from "@/generated/prisma/client";
import type { MobileApiError } from "@/contracts/mobile/common";
import type { BusinessOption } from "@/lib/selected-business";
import { bearerToken, findActiveMobileSession } from "@/lib/mobile/session-token";
import { mobileError } from "@/lib/mobile/http";

export type MobileOwnerContext = {
  sessionId: string;
  user: { id: string; email: string; name: string | null; role: Role };
  owner: Owner;
};

type Guard<T> = { ok: true; value: T } | { ok: false; response: NextResponse<MobileApiError> };

/** Bearer-token equivalent of requireOwner(): same soft-delete and owner checks as the web session. */
export async function requireMobileOwner(request: Request): Promise<Guard<MobileOwnerContext>> {
  const token = bearerToken(request);
  if (!token) return { ok: false, response: mobileError(401, "Please sign in.") };

  const session = await findActiveMobileSession(token);
  if (!session) return { ok: false, response: mobileError(401, "Please sign in again.") };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, owner: true },
  });
  if (!user?.owner || user.owner.deletedAt) {
    return { ok: false, response: mobileError(403, "No active Vendl business on this account.") };
  }

  const { owner, ...rest } = user;
  return { ok: true, value: { sessionId: session.id, user: rest, owner } };
}

/** The app passes the business explicitly (no cookie); it must belong to the signed-in owner. */
export async function requireMobileStand(
  ownerId: string,
  standId: string,
): Promise<Guard<BusinessOption>> {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId },
    select: { id: true, name: true, slug: true, timezone: true },
  });
  if (!stand) return { ok: false, response: mobileError(404, "Business not found.") };
  return { ok: true, value: stand };
}
