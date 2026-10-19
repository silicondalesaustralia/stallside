import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import type { MobileOrderDetail } from "@contracts/mobile/order-detail";
import { useDeliverOrder, useShipOrder } from "@/data/useShipOrder";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ChipRow from "@/components/ChipRow";
import PrimaryButton from "@/components/PrimaryButton";

/** Tracking + "shipped" / "delivered" emails, same as the web order shipping panel. */
export default function OrderShipForm({ order }: { order: MobileOrderDetail }) {
  const { shipping } = order;
  const [carrier, setCarrier] = useState(shipping.carrier ?? order.carriers[0] ?? "Other");
  const [trackingNumber, setTrackingNumber] = useState(shipping.trackingNumber ?? "");
  const ship = useShipOrder(order.id);
  const deliver = useDeliverOrder(order.id);

  const done = (result: { message: string }) => Alert.alert("Saved", result.message);
  const failed = (error: Error) => Alert.alert("Couldn't save", error.message);

  if (shipping.deliveredAt) return null;

  return (
    <Card title={shipping.shippedAt ? "Update tracking" : "Ship this order"}>
      <ChipRow
        options={order.carriers.map((name) => ({ value: name, label: name }))}
        value={carrier}
        onChange={setCarrier}
      />
      <TextInput
        style={styles.input}
        placeholder="Tracking number"
        value={trackingNumber}
        onChangeText={setTrackingNumber}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <PrimaryButton
        label={shipping.shippedAt ? "Save tracking & email customer" : "Mark shipped & email customer"}
        loading={ship.isPending}
        onPress={() =>
          ship.mutate({ carrier, trackingNumber, trackingUrl: "" }, { onSuccess: done, onError: failed })
        }
      />
      {shipping.shippedAt ? (
        <PrimaryButton
          label="Mark delivered & email customer"
          loading={deliver.isPending}
          onPress={() => deliver.mutate(undefined, { onSuccess: done, onError: failed })}
        />
      ) : (
        <Text style={styles.hint}>The customer gets an email with the tracking link.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: { color: colors.muted, fontSize: 13 },
});
