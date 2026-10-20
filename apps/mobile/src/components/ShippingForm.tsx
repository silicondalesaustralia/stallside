import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type {
  ShippingResponse,
  ShippingSettingsValues,
} from "@contracts/mobile/shipping";
import { useSaveShipping } from "@/data/useShipping";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ChipRow from "@/components/ChipRow";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

const FULFILMENT_OPTIONS = [
  { value: "PICKUP", label: "Pickup only" },
  { value: "DELIVERY", label: "Shipping only" },
  { value: "BOTH", label: "Both" },
] as const;

const MODE_OPTIONS = [
  { value: "FREE", label: "Free" },
  { value: "FLAT", label: "Flat rate" },
  { value: "CUSTOM", label: "Per product" },
] as const;

const MODE_HINTS: Record<ShippingSettingsValues["shippingMode"], string> = {
  FREE: "No shipping charge.",
  FLAT: "One amount per order.",
  CUSTOM: "Each product's shipping cost × quantity. Set it on each product.",
};

type Props = { standId: string; data: ShippingResponse };

/** Pickup/shipping default and shipping rates for one business. */
export default function ShippingForm({ standId, data }: Props) {
  const [values, setValues] = useState(data.settings);
  const save = useSaveShipping(standId);
  const set = (patch: Partial<ShippingSettingsValues>) =>
    setValues((current) => ({ ...current, ...patch }));

  function submit() {
    save.mutate(values, {
      onSuccess: () => Alert.alert("Saved", "Shipping settings updated."),
      onError: (error) => Alert.alert("Couldn't save", error.message),
    });
  }

  return (
    <View style={styles.wrap}>
      <Card title="Pickup & shipping">
        <Text style={styles.hint}>
          Applies to every product unless you change it on the product. With
          both on, customers choose at checkout. Pre-order pages keep their own
          setting.
        </Text>
        <ChipRow
          options={FULFILMENT_OPTIONS}
          value={values.fulfilmentDefault}
          onChange={(fulfilmentDefault) => set({ fulfilmentDefault })}
        />
      </Card>
      <Card title="Shipping rates">
        <Text style={styles.hint}>Charged on shop orders that ship.</Text>
        <ChipRow
          options={MODE_OPTIONS}
          value={values.shippingMode}
          onChange={(shippingMode) => set({ shippingMode })}
        />
        <Text style={styles.hint}>{MODE_HINTS[values.shippingMode]}</Text>
        <View style={styles.row}>
          {values.shippingMode === "FLAT" ? (
            <FormField
              label={`Flat rate (${data.currency})`}
              value={values.flat}
              onChangeText={(flat) => set({ flat })}
              keyboardType="decimal-pad"
              placeholder="9.95"
            />
          ) : null}
          {values.shippingMode !== "FREE" ? (
            <FormField
              label={`Free over (${data.currency})`}
              value={values.freeOver}
              onChangeText={(freeOver) => set({ freeOver })}
              keyboardType="decimal-pad"
              placeholder="Optional"
            />
          ) : null}
        </View>
      </Card>
      <PrimaryButton label="Save" loading={save.isPending} onPress={submit} />
      <Text style={styles.hint}>Add tracking on each order in Orders.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 13 },
});
