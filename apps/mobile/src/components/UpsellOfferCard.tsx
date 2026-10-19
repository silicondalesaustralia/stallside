import { StyleSheet, View } from "react-native";
import type {
  UpsellFormOptions,
  UpsellInputValues,
} from "@contracts/mobile/upsells";
import type { SetUpsellField } from "@/lib/upsell-form";
import { spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";

type Props = {
  values: UpsellInputValues;
  set: SetUpsellField;
  options: UpsellFormOptions;
};

/** Name, the product offered and an optional special price. */
export default function UpsellOfferCard({ values, set, options }: Props) {
  return (
    <Card title="Upsell">
      <View style={styles.stack}>
        <FormField
          label="Name"
          value={values.name}
          onChangeText={(name) => set("name", name)}
          placeholder="Eggs with any bread"
          hint="Only you see this."
        />
        <PickerField
          label="Product to offer"
          options={options.offerProducts}
          selected={values.offerProductId ? [values.offerProductId] : []}
          multiple={false}
          placeholder="Choose a product…"
          onChange={(ids) => set("offerProductId", ids[0] ?? "")}
        />
        <FormField
          label="Special price (optional)"
          value={values.price}
          onChangeText={(price) => set("price", price)}
          keyboardType="decimal-pad"
          placeholder={`Normal ${options.currency} price`}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
});
