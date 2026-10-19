import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomerDetail } from "@contracts/mobile/customers";
import { formatCents, formatDateTime, humanize } from "@/lib/format";
import { openOrder } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

export default function CustomerOrdersCard({ orders }: { orders: CustomerDetail["orders"] }) {
  return (
    <Card title="Orders">
      {orders.length === 0 ? <Text style={styles.empty}>No linked orders.</Text> : null}
      {orders.map((order) => (
        <Pressable
          key={order.id}
          accessibilityRole="button"
          onPress={() => openOrder(order.id)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.left}>
            <Text style={styles.number}>#{order.orderNumber}</Text>
            <Text style={styles.meta}>
              {order.standName} · {formatDateTime(order.createdAt)} · {humanize(order.paymentLabel)}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.total}>{formatCents(order.totalCents, order.currency)}</Text>
            <Text style={styles.meta}>{order.paymentStatusLabel}</Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.6 },
  left: { flexShrink: 1, gap: 2 },
  right: { alignItems: "flex-end", gap: 2 },
  number: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12 },
  total: { color: colors.text, fontSize: 15, fontWeight: "700" },
});
