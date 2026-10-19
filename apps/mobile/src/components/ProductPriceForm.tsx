import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import type { MobileProductDetail } from "@contracts/mobile/product-detail";
import { useSaveProductPrice } from "@/data/useProduct";
import { centsToInput, inputToCents } from "@/lib/money-input";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** Price and optional "Was" price, validated the same way as the web product form. */
export default function ProductPriceForm({ product }: { product: MobileProductDetail }) {
  const [price, setPrice] = useState(centsToInput(product.priceCents));
  const [was, setWas] = useState(centsToInput(product.compareAtPriceCents));
  const save = useSaveProductPrice(product.id);

  const priceCents = inputToCents(price);
  const wasCents = was.trim() ? inputToCents(was) : null;
  const unchanged = priceCents === product.priceCents && wasCents === product.compareAtPriceCents;
  const margin =
    priceCents != null && product.costCents != null
      ? `Profit ${formatCents(priceCents - product.costCents, product.currency)} each`
      : null;

  function submit() {
    if (priceCents == null) return Alert.alert("Check the price", "Enter an amount like 12.50.");
    if (was.trim() && wasCents == null) return Alert.alert("Check the 'Was' price", "Enter an amount or leave it blank.");
    save.mutate(
      { priceCents, compareAtPriceCents: wasCents },
      {
        onSuccess: () => Alert.alert("Saved", "Your shop shows the new price."),
        onError: (error) => Alert.alert("Couldn't save price", error.message),
      },
    );
  }

  return (
    <Card title="Price">
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Was (optional)</Text>
          <TextInput style={styles.input} value={was} onChangeText={setWas} keyboardType="decimal-pad" placeholder="—" />
        </View>
      </View>
      {product.hasOptions || product.hasVolumePrices ? (
        <Text style={styles.hint}>Option and volume prices are edited on the web.</Text>
      ) : null}
      {margin ? <Text style={styles.hint}>{margin}</Text> : null}
      <PrimaryButton label="Save price" loading={save.isPending} disabled={unchanged} onPress={submit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  fields: { flexDirection: "row", gap: spacing.sm },
  field: { flex: 1, gap: spacing.xs },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
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
