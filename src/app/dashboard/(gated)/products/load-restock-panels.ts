import { prisma } from "@/lib/prisma";
import { RESTOCK_ALERT_COOLDOWN_HOURS } from "@/lib/restock-alerts";
import { SubStatus } from "@/generated/prisma/client";

export type RestockPanelData = {
  standId: string;
  standName: string;
  subscriberCount: number;
  cooldownMessage: string | null;
};

export async function loadRestockPanels(
  ownerId: string,
): Promise<RestockPanelData[]> {
  const stands = await prisma.stand.findMany({
    where: { ownerId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  if (stands.length === 0) return [];

  return Promise.all(
    stands.map(async (stand) => {
      const subscriberCount = await prisma.restockSubscriber.count({
        where: { standId: stand.id, status: SubStatus.ACTIVE },
      });

      let cooldownMessage: string | null = null;
      if (RESTOCK_ALERT_COOLDOWN_HOURS > 0) {
        const since = new Date(
          Date.now() - RESTOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
        );
        const recent = await prisma.restockNotification.findFirst({
          where: { standId: stand.id, sentAt: { gte: since } },
          orderBy: { sentAt: "desc" },
          select: { sentAt: true },
        });
        if (recent) {
          const hoursAgo = Math.max(
            1,
            Math.round(
              (Date.now() - recent.sentAt.getTime()) / (60 * 60 * 1000),
            ),
          );
          const availableAt = new Date(
            recent.sentAt.getTime() +
              RESTOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
          );
          const time = availableAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });
          cooldownMessage = `You notified customers ${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago - available again at ${time}.`;
        }
      }

      return {
        standId: stand.id,
        standName: stand.name,
        subscriberCount,
        cooldownMessage,
      };
    }),
  );
}
