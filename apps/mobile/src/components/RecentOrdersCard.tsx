import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { HomeResponse } from "@contracts/mobile/home";
import { formatCents, humanize } from "@/lib/format";
import { openOrder } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

export default function RecentOrdersCard({ orders }: { orders: HomeResponse["recentOrders"] }) {
  return (
    <Card
      title="Recent orders"
      action={
        <Pressable accessibilityRole="button" onPress={() => router.navigate("/orders")}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      }
    >
      {orders.length === 0 ? (
        <Text style={styles.empty}>No orders yet.</Text>
      ) : (
        orders.map((order) => (
          <Pressable
            key={order.id}
            accessibilityRole="button"
            onPress={() => openOrder(order.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.left}>
              <Text style={styles.number}>#{order.orderNumber}</Text>
              <Text style={styles.method}>{humanize(order.paymentMethod)}</Text>
            </View>
            <Text style={styles.total}>{formatCents(order.totalCents, order.currency)}</Text>
          </Pressable>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.brand, fontWeight: "600" },
  empty: { color: colors.muted },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.6 },
  left: { gap: 2 },
  number: { color: colors.text, fontSize: 15, fontWeight: "600" },
  method: { color: colors.muted, fontSize: 13 },
  total: { color: colors.text, fontSize: 15, fontWeight: "700" },
});
