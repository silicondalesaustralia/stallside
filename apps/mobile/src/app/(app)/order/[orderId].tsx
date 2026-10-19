import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import { useOrder } from "@/data/useOrder";
import { useDeleteOrder } from "@/data/useOrders";
import { formatCents, formatDateTime, humanize } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import OrderCustomerCard from "@/components/OrderCustomerCard";
import OrderDeliveryCard from "@/components/OrderDeliveryCard";
import OrderItemsCard from "@/components/OrderItemsCard";
import OrderShipForm from "@/components/OrderShipForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useOrder(orderId);
  const remove = useDeleteOrder();

  function confirmDelete(detail: MobileOrderDetail) {
    const stockNote = detail.restoresStockOnDelete ? " Stock for its items will be put back." : "";
    Alert.alert(`Delete order ${detail.orderNumber}?`, `This can't be undone.${stockNote}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          remove.mutate(detail.id, {
            onSuccess: () => router.back(),
            onError: (error) => Alert.alert("Couldn't delete order", error.message),
          }),
      },
    ]);
  }

  const detail = order.data;
  return (
    <>
      <Stack.Screen options={{ title: detail ? `#${detail.orderNumber}` : "Order" }} />
      {order.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : !detail ? (
        <View style={styles.center}>
          <ErrorMessage error={order.error} />
        </View>
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Card>
            <Text style={styles.meta}>
              {detail.standName} · {formatDateTime(detail.createdAt)}
            </Text>
            <Text style={styles.total}>{formatCents(detail.totalCents, detail.currency)}</Text>
            <Text style={styles.tag}>{detail.channelLabel}</Text>
            <Text style={styles.meta}>
              {humanize(detail.paymentLabel)} · {detail.paymentStatusLabel}
            </Text>
          </Card>
          <OrderCustomerCard order={detail} />
          <OrderDeliveryCard order={detail} />
          {detail.canShip ? <OrderShipForm order={detail} /> : null}
          <OrderItemsCard order={detail} />
          <Pressable
            accessibilityRole="button"
            disabled={remove.isPending}
            onPress={() => confirmDelete(detail)}
            style={styles.delete}
          >
            <Text style={styles.deleteText}>{remove.isPending ? "Deleting…" : "Delete order"}</Text>
          </Pressable>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  meta: { color: colors.muted, fontSize: 14 },
  total: { color: colors.text, fontSize: 30, fontWeight: "800" },
  tag: { alignSelf: "flex-start", color: colors.brand, fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  delete: { alignItems: "center", padding: spacing.md },
  deleteText: { color: colors.danger, fontWeight: "600", fontSize: 16 },
});
