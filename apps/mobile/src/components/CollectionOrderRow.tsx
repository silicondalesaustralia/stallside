import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CollectionOrder } from "@contracts/mobile/collections";
import { formatCents } from "@/lib/format";
import { openOrder } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import CollectionStatusButton from "@/components/CollectionStatusButton";

type Props = {
  order: CollectionOrder;
  pending: boolean;
  onAdvance: (orderId: string) => void;
};

export default function CollectionOrderRow({ order, pending, onAdvance }: Props) {
  const items = order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ");
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={() => openOrder(order.id)} style={styles.info}>
        <Text style={styles.name}>{order.customerName || `#${order.orderNumber}`}</Text>
        <Text style={styles.meta}>
          #{order.orderNumber} · {order.isDelivery ? "Delivery" : "Pick up"}
          {order.subscriptionTitle ? ` · ${order.subscriptionTitle}` : ""}
        </Text>
        {order.address ? <Text style={styles.meta}>{order.address}</Text> : null}
        <Text style={styles.items}>{items}</Text>
        {order.note ? <Text style={styles.meta}>Note: {order.note}</Text> : null}
        {order.balanceDueCents ? (
          <Text style={styles.balance}>Balance owing {formatCents(order.balanceDueCents, order.currency)}</Text>
        ) : null}
      </Pressable>
      <CollectionStatusButton order={order} pending={pending} onAdvance={onAdvance} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  items: { color: colors.text, fontSize: 14 },
  balance: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
