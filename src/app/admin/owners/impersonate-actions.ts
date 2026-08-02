"use server";

import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { writeSessionJwt } from "@/lib/impersonation-cookie";
import { prisma } from "@/lib/prisma";
import { isPlatformAdminEmail, requireAdmin } from "@/lib/session";

/** Open the owner dashboard as this subscriber (admin support). */
export async function impersonateOwner(ownerId: string) {
  const admin = await requireAdmin();
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });
  if (!owner?.user.email) throw new Error("Owner not found");
  if (owner.userId === admin.id) {
    redirect("/dashboard");
  }

  console.info(`[${APP_NAME}] admin login-as`, {
    adminId: admin.id,
    adminEmail: admin.email,
    targetUserId: owner.user.id,
    targetEmail: owner.user.email,
    ownerId: owner.id,
  });

  await writeSessionJwt({
    sub: owner.user.id,
    id: owner.user.id,
    email: owner.user.email,
    name: owner.user.name,
    role: owner.user.role,
    impersonatorId: admin.id,
    impersonatorEmail: admin.email ?? "",
    impersonatorRole: admin.role,
    impersonatingOwnerId: owner.id,
  });

  redirect("/dashboard");
}

/** Restore the platform admin session after login-as. */
export async function stopImpersonating() {
  const session = await auth();
  const impersonator = session?.impersonator;
  const ownerId = session?.impersonatingOwnerId;
  if (!impersonator?.id) {
    redirect("/admin/owners");
  }

  const admin = await prisma.user.findUnique({
    where: { id: impersonator.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (
    !admin?.email ||
    admin.role !== Role.ADMIN ||
    !isPlatformAdminEmail(admin.email)
  ) {
    redirect("/login");
  }

  console.info(`[${APP_NAME}] admin login-as exit`, {
    adminId: admin.id,
    adminEmail: admin.email,
    wasUserId: session?.user?.id,
    ownerId,
  });

  await writeSessionJwt({
    sub: admin.id,
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  redirect(ownerId ? `/admin/owners/${ownerId}` : "/admin/owners");
}
