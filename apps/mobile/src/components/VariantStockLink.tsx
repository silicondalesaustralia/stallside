import { Pressable, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { openProduct } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";

/** Stands in for the stock stepper on list rows: variant stock is changed on the product screen. */
export default function VariantStockLink({
  productId,
  count,
}: {
  productId: string;
  count: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens the product to change stock per variant"
      onPress={() => openProduct(productId)}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={styles.text}>
        {count} variant{count === 1 ? "" : "s"} · Change stock
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.brand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 36,
  },
  pressed: { opacity: 0.6 },
  text: { color: colors.brand, fontSize: 14, fontWeight: "600" },
});
