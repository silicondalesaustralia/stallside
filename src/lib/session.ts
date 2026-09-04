import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/login-callback";
import { PLATFORM_ADMIN_EMAILS } from "@/lib/constants";

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (PLATFORM_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

/**
 * One auth() lookup per request. Refreshes role from DB and drops soft-deleted
 * owner sessions (JWT alone is not enough after wipe).
 */
export const getAuthSession = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      owner: { select: { deletedAt: true } },
    },
  });
  if (!dbUser) return null;

  session.user.role = dbUser.role;

  if (dbUser.owner?.deletedAt) {
    return null;
  }

  return session;
});

export const requireUser = cache(async () => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    const h = await headers();
    const path = h.get("x-stallside-pathname") ?? "/dashboard";
    const search = h.get("x-stallside-search") ?? "";
    const callbackUrl = safeCallbackUrl(`${path}${search}`);
    redirect(
      `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }
  return session.user;
});

export const requireOwner = cache(async () => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    const h = await headers();
    const path = h.get("x-stallside-pathname") ?? "/dashboard";
    const search = h.get("x-stallside-search") ?? "";
    const callbackUrl = safeCallbackUrl(`${path}${search}`);
    redirect(
      `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }
  const user = session.user;
  const owner = await prisma.owner.findUnique({
    where: { userId: user.id },
  });
  if (!owner || owner.deletedAt) {
    redirect("/onboarding");
  }
  return {
    user,
    owner,
    impersonator: session.impersonator ?? null,
  };
});

/** Owner gate for server actions that mutate data (includes admin login-as). */
export async function requireOwnerWrite() {
  return requireOwner();
}

export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (!isPlatformAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  return { ...user, role: Role.ADMIN };
});
