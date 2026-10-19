import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { HomeResponse } from "@contracts/mobile/home";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

export default function LowStockCard({ items }: { items: HomeResponse["lowStock"] }) {
  return (
    <Card
      title="Low stock"
      action={
        <Pressable accessibilityRole="button" onPress={() => router.push("/inventory")}>
          <Text style={styles.link}>Inventory</Text>
        </Pressable>
      }
    >
      {items.length === 0 ? (
        <Text style={styles.empty}>Everything is above its low-stock level.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.qty, item.stockQuantity <= 0 && styles.out]}>
              {item.stockQuantity <= 0 ? "Sold out" : `${item.stockQuantity} left`}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.brand, fontWeight: "600" },
  empty: { color: colors.muted },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, paddingVertical: spacing.xs },
  name: { color: colors.text, fontSize: 15, flexShrink: 1 },
  qty: { color: colors.text, fontSize: 15, fontWeight: "600" },
  out: { color: colors.danger },
});
