import { StyleSheet, View } from "react-native";
import type { DiscountInputValues } from "@contracts/mobile/discounts";
import { DISCOUNT_TYPE_OPTIONS, type SetDiscountField } from "@/lib/discount-form";
import { spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ChipRow from "@/components/ChipRow";
import FormField from "@/components/FormField";

type Props = { values: DiscountInputValues; set: SetDiscountField };

/** Code, label and what the code takes off. */
export default function DiscountBasicsCard({ values, set }: Props) {
  return (
    <Card title="Discount">
      <View style={styles.stack}>
        <FormField
          label="Code"
          value={values.code}
          onChangeText={(code) => set("code", code.toUpperCase())}
          autoCapitalize="characters"
          placeholder="SUMMER10"
          hint="What customers type at checkout."
        />
        <FormField
          label="Name (optional)"
          value={values.name}
          onChangeText={(name) => set("name", name)}
          placeholder="Only you see this"
        />
        <ChipRow options={DISCOUNT_TYPE_OPTIONS} value={values.type} onChange={(type) => set("type", type)} />
        <View style={styles.row}>
          {values.type !== "FREE_DELIVERY" ? (
            <FormField
              label={values.type === "PERCENT_OFF" ? "Percent off" : "Amount off"}
              value={values.value}
              onChangeText={(value) => set("value", value)}
              keyboardType="decimal-pad"
              placeholder={values.type === "PERCENT_OFF" ? "10" : "5.00"}
            />
          ) : null}
          <FormField
            label="Minimum spend"
            value={values.minOrder}
            onChangeText={(minOrder) => set("minOrder", minOrder)}
            keyboardType="decimal-pad"
            placeholder="None"
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
