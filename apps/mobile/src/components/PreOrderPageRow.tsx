import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { MobilePreOrderPage } from "@contracts/mobile/preorders";
import { preOrderDeadline, preOrderMeta } from "@/lib/preorder-labels";
import { colors, spacing } from "@/lib/theme";

type Props = {
  page: MobilePreOrderPage;
  onPress: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
};

export default function PreOrderPageRow({ page, onPress, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(page.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.meta}>{preOrderMeta(page)}</Text>
        <Text style={page.ordersOpen ? styles.meta : styles.closed}>
          {preOrderDeadline(page)}
        </Text>
      </View>
      <Switch
        accessibilityLabel={`${page.title} on the shop`}
        value={page.isActive}
        onValueChange={(value) => onToggle(page.id, value)}
        trackColor={{ true: colors.brand }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  closed: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
