import { StyleSheet, Text, View } from "react-native";
import type {
  UpsellFormOptions,
  UpsellInputValues,
} from "@contracts/mobile/upsells";
import type { SetUpsellField } from "@/lib/upsell-form";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PickerField from "@/components/PickerField";
import SwitchRow from "@/components/SwitchRow";

type Props = {
  values: UpsellInputValues;
  set: SetUpsellField;
  options: UpsellFormOptions;
};

/** Which carts show the upsell, and on which checkout. */
export default function UpsellScopeCard({ values, set, options }: Props) {
  return (
    <Card title="Show it when the cart has…">
      <View style={styles.stack}>
        <SwitchRow
          label="Anything (sitewide)"
          hint="Every cart, unless a category or product upsell fits better."
          value={values.sitewide}
          onChange={(on) => set("sitewide", on)}
        />
        <PickerField
          label="Categories"
          options={options.categories}
          selected={values.categoryIds}
          multiple
          placeholder="None"
          onChange={(ids) => set("categoryIds", ids)}
        />
        <PickerField
          label="Products"
          options={options.products}
          selected={values.productIds}
          multiple
          placeholder="None"
          onChange={(ids) => set("productIds", ids)}
        />
        <Text style={styles.hint}>
          A product upsell wins over a category one, which wins over sitewide.
          Pre-order carts use pre-order add-ons instead.
        </Text>
        <SwitchRow
          label="Online store cart"
          value={values.showOnWebsite}
          onChange={(on) => set("showOnWebsite", on)}
        />
        <SwitchRow
          label="Stall checkout"
          hint="The QR code at the stall."
          value={values.showAtStall}
          onChange={(on) => set("showAtStall", on)}
        />
        <SwitchRow
          label="Turned on"
          value={values.isActive}
          onChange={(on) => set("isActive", on)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  hint: { color: colors.muted, fontSize: 12 },
});
