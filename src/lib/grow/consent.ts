import { prisma } from "@/lib/prisma";
import {
  newUnsubToken,
  signUnsubLink,
  verifyUnsubLink,
} from "@/lib/grow/unsub-token";

export { newUnsubToken, signUnsubLink, verifyUnsubLink };

export async function isMarketingSuppressed(
  ownerId: string,
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  const hit = await prisma.marketingSuppression.findUnique({
    where: { ownerId_email: { ownerId, email: normalized } },
    select: { id: true },
  });
  return Boolean(hit);
}

export async function suppressMarketingEmail(input: {
  ownerId: string;
  email: string;
  reason?: string;
  token?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const token = input.token ?? newUnsubToken();
  await prisma.marketingSuppression.upsert({
    where: { ownerId_email: { ownerId: input.ownerId, email } },
    create: {
      ownerId: input.ownerId,
      email,
      reason: input.reason ?? "unsubscribed",
      token,
    },
    update: { reason: input.reason ?? "unsubscribed" },
  });
  await prisma.customer.updateMany({
    where: { ownerId: input.ownerId, email },
    data: { marketingConsent: false },
  });
  return token;
}
