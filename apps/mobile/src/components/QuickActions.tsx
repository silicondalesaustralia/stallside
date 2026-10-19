import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { colors, spacing } from "@/lib/theme";

const ACTIONS: { label: string; icon: "basket-outline" | "cube-outline" | "people-outline"; href: Href }[] = [
  { label: "Pick ups", icon: "basket-outline", href: "/collections" },
  { label: "Inventory", icon: "cube-outline", href: "/inventory" },
  { label: "Customers", icon: "people-outline", href: "/customers" },
];

export default function QuickActions() {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          accessibilityRole="button"
          onPress={() => router.push(action.href)}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name={action.icon} size={22} color={colors.brand} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
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
});
