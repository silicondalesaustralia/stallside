import { z } from "zod";

export const MOBILE_NOTIFICATION_STATUSES = ["OPEN", "ACTIONED", "CLOSED"] as const;
export const mobileNotificationStatus = z.enum(MOBILE_NOTIFICATION_STATUSES);
export type MobileNotificationStatus = z.infer<typeof mobileNotificationStatus>;

export const mobileNotification = z.object({
  id: z.string(),
  type: z.string(),
  status: mobileNotificationStatus,
  title: z.string(),
  message: z.string(),
  standName: z.string().nullable(),
  createdAt: z.string(),
  orderId: z.string().nullable(),
  productId: z.string().nullable(),
  email: z.string().nullable(),
  setupPath: z.string().nullable(),
});
export type MobileNotification = z.infer<typeof mobileNotification>;

export const notificationsResponse = z.object({
  openCount: z.number().int(),
  notifications: z.array(mobileNotification),
});
export type NotificationsResponse = z.infer<typeof notificationsResponse>;

export const notificationStatusBody = z.object({ status: mobileNotificationStatus });
export type NotificationStatusBody = z.infer<typeof notificationStatusBody>;

export const alertSettings = z.object({
  emailAlertsEnabled: z.boolean(),
  pushAlertsEnabled: z.boolean(),
  contactEmail: z.string(),
  appDevices: z.number().int(),
});
export type AlertSettings = z.infer<typeof alertSettings>;

export const alertSettingsBody = z
  .object({ emailAlertsEnabled: z.boolean(), pushAlertsEnabled: z.boolean() })
  .partial();
export type AlertSettingsBody = z.infer<typeof alertSettingsBody>;
