import { Alert, Linking, Pressable, StyleSheet, Text } from "react-native";
import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import { formatDateTime } from "@/lib/format";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";

async function openTracking(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open tracking", "Please try again.");
  }
}

export default function OrderDeliveryCard({ order }: { order: MobileOrderDetail }) {
  const { delivery, shipping } = order;
  if (!delivery) return null;
  return (
    <Card title={delivery.label}>
      <Text style={styles.text}>{delivery.address ?? "No address given"}</Text>
      {delivery.notes ? <Text style={styles.muted}>{delivery.notes}</Text> : null}
      {shipping.shippedAt ? (
        <Text style={styles.text}>
          Shipped {formatDateTime(shipping.shippedAt)}
          {shipping.carrier ? ` · ${shipping.carrier}` : ""}
        </Text>
      ) : (
        <Text style={styles.muted}>Not shipped yet</Text>
      )}
      {shipping.deliveredAt ? <Text style={styles.text}>Delivered {formatDateTime(shipping.deliveredAt)}</Text> : null}
      {shipping.trackingUrl ? (
        <Pressable accessibilityRole="link" onPress={() => void openTracking(shipping.trackingUrl ?? "")}>
          <Text style={styles.link}>Track {shipping.trackingNumber ?? "parcel"}</Text>
        </Pressable>
      ) : shipping.trackingNumber ? (
        <Text style={styles.text}>Tracking {shipping.trackingNumber}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 14 },
  link: { color: colors.brand, fontSize: 15, textDecorationLine: "underline" },
});
