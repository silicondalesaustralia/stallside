import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";
import { canUseAiWebsiteBuilder } from "@/lib/website-ai/config";

/** True when this owner sees the new guided assistant instead of templates. */
export function assistantEnabledFor(ownerId: string): boolean {
  return websiteSectionEnabledFor(ownerId) && canUseAiWebsiteBuilder(ownerId);
}

/** Owner ID for API routes (JSON responses, no redirects); null when not allowed. */
export async function assistantOwnerIdFromSession(): Promise<string | null> {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  const owner = await prisma.owner.findUnique({ where: { userId }, select: { id: true, deletedAt: true } });
  if (!owner || owner.deletedAt) return null;
  return assistantEnabledFor(owner.id) ? owner.id : null;
}
