import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { countAppDevices } from "@/lib/push-devices";

export type AlertSettingsInput = {
  emailAlertsEnabled?: boolean;
  pushAlertsEnabled?: boolean;
  alertEmails?: string[];
};

export async function getOwnerAlertSettings(ownerId: string) {
  const [owner, appDevices] = await Promise.all([
    prisma.owner.findUniqueOrThrow({
      where: { id: ownerId },
      select: { emailAlertsEnabled: true, pushAlertsEnabled: true, contactEmail: true, alertEmails: true },
    }),
    countAppDevices(ownerId),
  ]);
  return { ...owner, appDevices };
}

/** Email/push alert switches and extra alert emails; omitted fields stay as they are. */
export async function updateOwnerAlertSettings(ownerId: string, input: AlertSettingsInput) {
  await prisma.owner.update({ where: { id: ownerId }, data: input });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/notifications");
}
