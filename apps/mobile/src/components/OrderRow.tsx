import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileOrderSummary } from "@contracts/mobile/orders";
import { formatCents, formatDateTime, humanize } from "@/lib/format";
import { openOrder } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";

function itemsLine(order: MobileOrderSummary): string {
  const preview = order.items
    .slice(0, 3)
    .map((item) => `${item.quantity}× ${item.name}`)
    .join(", ");
  return order.items.length > 3 ? `${preview} +${order.items.length - 3} more` : preview;
}

function deliveryTag(order: MobileOrderSummary): string | null {
  if (order.handoverMode !== "DELIVER") return null;
  if (order.deliveredAt) return "Delivered";
  if (order.shippedAt) return "Shipped";
  return "To deliver";
}

export default function OrderRow({ order }: { order: MobileOrderSummary }) {
  const tags = [
    humanize(order.paymentStatus),
    order.isPreOrder ? "Pre-order" : null,
    deliveryTag(order),
    order.collectionStatus ? humanize(order.collectionStatus) : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openOrder(order.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{order.customerName || `#${order.orderNumber}`}</Text>
        <Text style={styles.total}>{formatCents(order.totalCents, order.currency)}</Text>
      </View>
      <Text style={styles.meta}>
        #{order.orderNumber} · {formatDateTime(order.createdAt)}
      </Text>
      {order.items.length > 0 ? <Text style={styles.items}>{itemsLine(order)}</Text> : null}
      <View style={styles.tags}>
        {tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  header: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  title: { color: colors.text, fontSize: 16, fontWeight: "600", flexShrink: 1 },
  total: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  items: { color: colors.text, fontSize: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    backgroundColor: colors.background,
    color: colors.brand,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
});
