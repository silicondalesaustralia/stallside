import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/login-callback";

export async function requireUser() {
  const session = await auth();
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
}

export async function requireOwner() {
  const user = await requireUser();
  const owner = await prisma.owner.findUnique({
    where: { userId: user.id },
  });
  if (!owner) {
    redirect("/onboarding");
  }
  return { user, owner };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  return user;
}
