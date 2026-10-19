import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { colors, spacing } from "@/lib/theme";
import { useNotifications } from "@/data/useNotifications";

type IconName = "basket-outline" | "cube-outline" | "people-outline" | "notifications-outline";

const ACTIONS: { label: string; icon: IconName; href: Href }[] = [
  { label: "Pick ups", icon: "basket-outline", href: "/collections" },
  { label: "Inventory", icon: "cube-outline", href: "/inventory" },
  { label: "Customers", icon: "people-outline", href: "/customers" },
  { label: "Alerts", icon: "notifications-outline", href: "/notifications" },
];

export default function QuickActions() {
  const openAlerts = useNotifications().data?.openCount ?? 0;
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => {
        const badge = action.href === "/notifications" && openAlerts > 0 ? openAlerts : null;
        return (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={badge ? `${action.label}, ${badge} open` : action.label}
            onPress={() => router.push(action.href)}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <Ionicons name={action.icon} size={22} color={colors.brand} />
            <Text style={styles.label}>{action.label}</Text>
            {badge ? <Text style={styles.badge}>{badge > 99 ? "99+" : badge}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.7 },
  label: { color: colors.text, fontSize: 13, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: 6,
    right: 8,
    minWidth: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.danger,
    color: colors.brandText,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
