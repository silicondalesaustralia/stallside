import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { MobileDiscountRow } from "@contracts/mobile/discounts";
import { colors, spacing } from "@/lib/theme";

type Props = {
  discount: MobileDiscountRow;
  onPress: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
};

/** Code, what it gives, usage and an on/off switch, like a row on the web Discounts page. */
export default function DiscountRow({ discount, onPress, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(discount.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.code}>{discount.code}</Text>
        {discount.name ? <Text style={styles.name}>{discount.name}</Text> : null}
        <Text style={styles.meta}>{discount.summary}</Text>
        <Text style={styles.meta}>
          {discount.uses}
          {discount.status ? ` · ${discount.status}` : ""}
        </Text>
      </View>
      <Switch
        accessibilityLabel={`${discount.code} active`}
        value={discount.isActive}
        onValueChange={(value) => onToggle(discount.id, value)}
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
  code: { color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  name: { color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 13 },
});
