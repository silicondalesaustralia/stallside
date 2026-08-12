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

/** One auth() lookup per request (layout + pages share this). */
export const getAuthSession = cache(async () => auth());

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
  if (!owner) {
    redirect("/onboarding");
  }
  return {
    user,
    owner,
    impersonator: session.impersonator ?? null,
  };
});

export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (user.role !== Role.ADMIN || !isPlatformAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
});
