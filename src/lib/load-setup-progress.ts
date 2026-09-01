import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { productDashboardWhere } from "@/lib/product-visibility";
import {
  resolveSetupTasks,
  setupProgressSummary,
  type SetupFacts,
  type SetupTaskStatus,
} from "@/lib/setup-tasks";

export type SetupProgressPayload = {
  tasks: SetupTaskStatus[];
  summary: ReturnType<typeof setupProgressSummary>;
  facts: SetupFacts;
};

export const loadSetupProgress = cache(async (input: {
  ownerId: string;
  selectedStandId: string | null;
  standSlug: string | null;
  standCount: number;
  stripeChargesEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  businessMode?: string | null;
}): Promise<SetupProgressPayload> => {
  const standId = input.selectedStandId;

  const [productCount, orderCount] = await Promise.all([
    standId
      ? prisma.product.count({
          where: {
            ownerId: input.ownerId,
            standId,
            ...productDashboardWhere,
          },
        })
      : Promise.resolve(0),
    prisma.order.count({
      where: {
        ownerId: input.ownerId,
        ...(standId ? { standId } : {}),
        paymentStatus: { in: COUNTED_STATUSES },
      },
    }),
  ]);

  const facts: SetupFacts = {
    standCount: input.standCount,
    productCount,
    stripeChargesEnabled: input.stripeChargesEnabled,
    emailAlertsEnabled: input.emailAlertsEnabled,
    pushAlertsEnabled: input.pushAlertsEnabled,
    orderCount,
    hasStand: input.standCount > 0,
    standSlug: input.standSlug,
    selectedStandId: input.selectedStandId,
    businessMode: input.businessMode,
  };

  const tasks = resolveSetupTasks(facts);
  return { tasks, summary: setupProgressSummary(tasks), facts };
});
