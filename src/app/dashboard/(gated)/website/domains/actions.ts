"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import {
  DomainActionFailure,
  connectCustomDomain,
  disconnectCustomDomain,
  setPrimaryCustomDomain,
  verifyCustomDomain,
} from "@/lib/domains/lifecycle";

function redirectError(code: string) {
  redirect(`/dashboard/website/domains?error=${encodeURIComponent(code)}`);
}

export async function connectDomainAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const hostname = String(formData.get("hostname") ?? "");
  const ownerRow = await prisma.owner.findUniqueOrThrow({
    where: { id: owner.id },
    include: { user: { select: { email: true, role: true } } },
  });

  try {
    await connectCustomDomain({
      storefrontId: storefront.id,
      owner: ownerRow,
      hostname,
    });
  } catch (e) {
    if (e instanceof DomainActionFailure) redirectError(e.code);
    throw e;
  }

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?connected=1");
}

export async function checkDomainAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const domainId = String(formData.get("domainId") ?? "");

  try {
    await verifyCustomDomain({
      storefrontId: storefront.id,
      domainId,
    });
  } catch (e) {
    if (e instanceof DomainActionFailure) redirectError(e.code);
    throw e;
  }

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?checked=1");
}

export async function makePrimaryDomainAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const domainId = String(formData.get("domainId") ?? "");

  try {
    await setPrimaryCustomDomain({
      storefrontId: storefront.id,
      domainId,
    });
  } catch (e) {
    if (e instanceof DomainActionFailure) redirectError(e.code);
    throw e;
  }

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?primary=1");
}

export async function disconnectDomainAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const domainId = String(formData.get("domainId") ?? "");

  try {
    await disconnectCustomDomain({
      storefrontId: storefront.id,
      domainId,
    });
  } catch (e) {
    if (e instanceof DomainActionFailure) redirectError(e.code);
    throw e;
  }

  revalidatePath("/dashboard/website/domains");
  redirect("/dashboard/website/domains?disconnected=1");
}
