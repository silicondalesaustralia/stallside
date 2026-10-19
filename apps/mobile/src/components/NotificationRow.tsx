import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileNotification } from "@contracts/mobile/notifications";
import { formatDateTime } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

const STATUS_LABEL: Record<MobileNotification["status"], string> = {
  OPEN: "Open",
  ACTIONED: "Actioned",
  CLOSED: "Closed",
};

type Props = { notification: MobileNotification; onPress: (notification: MobileNotification) => void };

export default function NotificationRow({ notification, onPress }: Props) {
  const open = notification.status === "OPEN";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(notification)}
      style={({ pressed }) => [styles.row, open && styles.open, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        {open ? <View style={styles.dot} /> : null}
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={[styles.status, open && styles.statusOpen]}>{STATUS_LABEL[notification.status]}</Text>
      </View>
      {notification.standName ? <Text style={styles.meta}>{notification.standName}</Text> : null}
      <Text style={styles.message}>{notification.message}</Text>
      <Text style={styles.meta}>{formatDateTime(notification.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  open: { borderColor: "#e0a526", borderWidth: 2 },
  pressed: { opacity: 0.7 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  title: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "600" },
  status: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  statusOpen: { color: colors.text },
  message: { color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 13 },
});
