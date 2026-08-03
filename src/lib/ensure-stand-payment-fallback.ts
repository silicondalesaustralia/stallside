import { prisma } from "@/lib/prisma";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";
import { sendOwnerEmail } from "@/lib/notify-email";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { lifecycleLinks } from "@/lib/lifecycle-emails/links";
import { standOffersCard, standOffersPayPal } from "@/lib/stand-payment-brands";
import { localTransferForCurrency } from "@/lib/local-transfer";

/**
 * After Pro → Free, ensure every stand still has a usable checkout method.
 * Free still supports Tap & Go (with Stallside fee) - do not turn card off.
 * Force Cash only when the stand would otherwise have nothing.
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
    const cardOk = standOffersCard(stand, owner);
    const hasMethod = stand.acceptCash || payidOk || paypalOk || cardOk;
    if (hasMethod) continue;

    await prisma.stand.update({
      where: { id: stand.id },
      data: { acceptCash: true },
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
      `<p>Your <strong>Pro</strong> access ended and you&apos;re on <strong>Free</strong>
       ($0/mo). At least one stand had no payment method turned on.</p>
       <p>We turned on <strong>Cash</strong> for:
       ${forced.map((n) => escapeHtml(n)).join(", ")}
       so customers scanning your QR can still check out.</p>
       <p>Tap &amp; Go still works on Free (Stallside fee 2.5%). You can change
       payment methods under My stands, or
       <a href="${billingHref}">upgrade to Pro</a>
       to remove the Stallside transaction fee.</p>`,
      { kind: "pro_lapse_cash_fallback" },
    );
  } catch (error) {
    console.error("Failed to notify owner about cash fallback", error);
  }
}
