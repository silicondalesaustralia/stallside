import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";

export async function sendStockAlert(input: {
  owner: {
    id: string;
    emailAlertsEnabled: boolean;
    pushAlertsEnabled: boolean;
  };
  recipients: string[];
  standId: string;
  product: { id: string; stockQuantity: number; lowStockThreshold: number };
  title: string;
  body: string;
  channel: string;
  type: "sold_out" | "low_stock";
}) {
  if (input.owner.emailAlertsEnabled && input.recipients.length) {
    await sendOwnerEmail(
      input.recipients,
      `[${APP_NAME}] ${input.title}`,
      `<p><strong>${input.title}</strong></p><p>${input.body}</p>`,
    );
  }

  if (input.owner.pushAlertsEnabled) {
    await sendOwnerPush(input.owner.id, {
      title: input.title,
      body: input.body,
      data: { type: input.type, productId: input.product.id },
    }).catch((error) => {
      console.error(`[${APP_NAME}] ${input.type} push failed`, error);
    });
  }

  if (
    (input.owner.emailAlertsEnabled && input.recipients.length) ||
    input.owner.pushAlertsEnabled
  ) {
    await prisma.lowStockAlert.create({
      data: {
        productId: input.product.id,
        ownerId: input.owner.id,
        standId: input.standId,
        stockQuantityAtAlert: input.product.stockQuantity,
        threshold: input.product.lowStockThreshold,
        channel: input.channel,
      },
    });
  }
}
