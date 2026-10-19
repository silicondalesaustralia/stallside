import { StyleSheet, Text, View } from "react-native";
import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

export default function OrderItemsCard({ order }: { order: MobileOrderDetail }) {
  return (
    <Card title="Items">
      {order.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.name}>
              {item.quantity}× {item.name}
            </Text>
            {item.options ? <Text style={styles.options}>{item.options}</Text> : null}
          </View>
          <Text style={styles.price}>{formatCents(item.lineTotalCents, order.currency)}</Text>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalLabel}>{formatCents(order.totalCents, order.currency)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, paddingVertical: spacing.xs },
  left: { flexShrink: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15 },
  options: { color: colors.muted, fontSize: 13 },
  price: { color: colors.text, fontSize: 15, fontWeight: "600" },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { color: colors.text, fontSize: 16, fontWeight: "800" },
});
