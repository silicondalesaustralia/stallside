import { prisma } from "@/lib/prisma";
import { generateGiftCardCode } from "@/lib/grow/gift-card-code";

export {
  generateGiftCardCode,
  GIFT_CARD_CHECKOUT_REDEMPTION_DEFERRED,
} from "@/lib/grow/gift-card-code";

export async function issueGiftCard(input: {
  ownerId: string;
  amountCents: number;
  currency: string;
  customerId?: string | null;
  note?: string | null;
  expiresAt?: Date | null;
}) {
  if (input.amountCents < 100) throw new Error("Minimum gift card is $1");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateGiftCardCode();
    try {
      return await prisma.$transaction(async (tx) => {
        const card = await tx.giftCard.create({
          data: {
            ownerId: input.ownerId,
            code,
            initialCents: input.amountCents,
            balanceCents: input.amountCents,
            currency: input.currency,
            customerId: input.customerId ?? null,
            note: input.note ?? null,
            expiresAt: input.expiresAt ?? null,
          },
        });
        await tx.giftCardTransaction.create({
          data: {
            giftCardId: card.id,
            type: "ISSUE",
            amountCents: input.amountCents,
            note: "Issued",
          },
        });
        return card;
      });
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("Could not allocate gift card code");
}
