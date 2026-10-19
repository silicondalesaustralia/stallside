import type { AlertButton } from "react-native";
import type { MobileNotification, MobileNotificationStatus } from "@contracts/mobile/notifications";
import { openOrder, openProduct } from "@/lib/navigation";
import { mailtoUrl, openLink } from "@/lib/open-link";

type Handlers = {
  setStatus: (status: MobileNotificationStatus) => void;
  remove: () => void;
  openWeb: (path: string) => void;
};

/** The choices for a tapped notification: go to what it's about, then the web inbox actions. */
export function notificationMenu(notification: MobileNotification, handlers: Handlers): AlertButton[] {
  const buttons: AlertButton[] = [];
  const { orderId, productId, email, setupPath, status } = notification;

  if (orderId) buttons.push({ text: "Open order", onPress: () => openOrder(orderId) });
  if (productId) buttons.push({ text: "Open product", onPress: () => openProduct(productId) });
  if (email) buttons.push({ text: `Email ${email}`, onPress: () => void openLink(mailtoUrl(email)) });
  if (setupPath) buttons.push({ text: "Open setup", onPress: () => handlers.openWeb(setupPath) });

  if (status !== "ACTIONED") buttons.push({ text: "Mark actioned", onPress: () => handlers.setStatus("ACTIONED") });
  if (status !== "CLOSED") buttons.push({ text: "Close", onPress: () => handlers.setStatus("CLOSED") });
  if (status !== "OPEN") buttons.push({ text: "Reopen", onPress: () => handlers.setStatus("OPEN") });
  buttons.push({ text: "Delete", style: "destructive", onPress: handlers.remove });
  buttons.push({ text: "Cancel", style: "cancel" });
  return buttons;
}
