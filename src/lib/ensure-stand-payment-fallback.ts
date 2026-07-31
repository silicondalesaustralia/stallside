import { prisma } from "@/lib/prisma";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { sendOwnerEmail } from "@/lib/notify-email";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { standOffersPayPal } from "@/lib/stand-payment-brands";
import { localTransferForCurrency } from "@/lib/local-transfer";

/**
 * When Pro lapses, Card becomes unavailable. Ensure every stand still has
 * a customer-usable method (force Cash if needed) and notify the owner.
 */
export async function ensureStandsHaveStarterPaymentMethod(ownerId: string) {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      user: true,
      stands: true,
    },
  });
  if (!owner) return;

  const forced: string[] = [];

  for (const stand of owner.stands) {
    const method = localTransferForCurrency(stand.currency);
    const payidOk =
      stand.acceptLocalTransfer &&
      Boolean(stand.localTransferAlias?.trim()) &&
      method != null &&
      stand.localTransferMethodId === method.id;
    const paypalOk = standOffersPayPal(stand, owner);
    // On Starter, card is never offered — ignore acceptCard.
    const hasMethod = stand.acceptCash || payidOk || paypalOk;
    if (hasMethod) continue;

    await prisma.stand.update({
      where: { id: stand.id },
      data: { acceptCash: true, acceptCard: false, acceptPayPal: false },
    });
    forced.push(stand.name);
  }

  if (forced.length === 0) return;

  const to = ownerAlertRecipients(owner);
  if (!to.length) return;
  const billingHref = lifecycleLinks().billingPro;

  try {
    await sendOwnerEmail(
      to,
      `${APP_NAME}: Cash enabled so checkout still works`,
      `<p>Your <strong>Pro</strong> access ended, so you&apos;re on <strong>Starter</strong>
       and Tap &amp; Go is off.</p>
       <p>We turned on <strong>Cash</strong> for:
       ${forced.map((n) => escapeHtml(n)).join(", ")}
       so customers scanning your QR can still check out.</p>
       <p>You can change payment methods anytime under My stands, or
       <a href="${billingHref}">upgrade to Pro</a>
       for Tap &amp; Go again.</p>`,
      { kind: "pro_lapse_cash_fallback" },
    );
  } catch (error) {
    console.error("Failed to notify owner about cash fallback", error);
  }
}
