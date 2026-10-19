import { StyleSheet, View } from "react-native";
import type { DiscountInputValues } from "@contracts/mobile/discounts";
import type { SetDiscountField } from "@/lib/discount-form";
import { spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import SwitchRow from "@/components/SwitchRow";

type Props = { values: DiscountInputValues; set: SetDiscountField };

/** Where the code works and how often it can be used. */
export default function DiscountRulesCard({ values, set }: Props) {
  return (
    <Card title="Rules">
      <View style={styles.stack}>
        <SwitchRow label="Active" value={values.isActive} onChange={(on) => set("isActive", on)} />
        <SwitchRow
          label="Online orders"
          value={values.showOnWebsite}
          onChange={(on) => set("showOnWebsite", on)}
        />
        <SwitchRow label="At the stall" value={values.showAtStall} onChange={(on) => set("showAtStall", on)} />
        <SwitchRow
          label="First order only"
          hint="Only customers who haven't ordered before."
          value={values.firstOrderOnly}
          onChange={(on) => set("firstOrderOnly", on)}
        />
        <View style={styles.row}>
          <FormField
            label="Total uses"
            value={values.usageLimit}
            onChangeText={(usageLimit) => set("usageLimit", usageLimit)}
            keyboardType="number-pad"
            placeholder="Unlimited"
          />
          <FormField
            label="Per customer"
            value={values.perCustomerLimit}
            onChangeText={(perCustomerLimit) => set("perCustomerLimit", perCustomerLimit)}
            keyboardType="number-pad"
            placeholder="Unlimited"
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
});
