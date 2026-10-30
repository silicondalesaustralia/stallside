import { StyleSheet, Text } from "react-native";
import type { MobileMaterial } from "@contracts/mobile/materials";
import type { PurchaseForm } from "@/lib/usePurchaseForm";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import UnitChips from "@/components/UnitChips";

type Props = {
  materials: MobileMaterial[];
  form: PurchaseForm;
  fixedMaterial: boolean;
};

/** Same fields as "Record incoming supplies" on the web Materials page. */
export default function PurchaseFormFields({
  materials,
  form,
  fixedMaterial,
}: Props) {
  const { values, set, material } = form;
  return (
    <>
      <Card title={fixedMaterial && material ? material.name : "What arrived"}>
        {fixedMaterial ? null : (
          <PickerField
            label="Material"
            options={materials.map((m) => ({ id: m.id, label: m.name }))}
            selected={values.ingredientId ? [values.ingredientId] : []}
            multiple={false}
            placeholder="Choose…"
            onChange={(ids) => ids[0] && set.ingredientId(ids[0])}
          />
        )}
        <FormField
          label="Quantity received"
          value={values.quantity}
          onChangeText={set.quantity}
          keyboardType="decimal-pad"
        />
        {form.units.length > 0 ? (
          <UnitChips
            units={form.units}
            value={values.unit}
            onChange={set.unit}
          />
        ) : (
          <Text style={styles.hint}>Choose a material to pick a unit.</Text>
        )}
        <FormField
          label="Total paid"
          value={values.total}
          onChangeText={set.total}
          keyboardType="decimal-pad"
          hint="Include delivery if you want it in your costs."
        />
      </Card>
      <Card title="Details">
        <FormField
          label="Supplier"
          value={values.supplier}
          onChangeText={set.supplier}
          placeholder={material?.supplier ?? undefined}
        />
        <FormField
          label="Received"
          value={values.receivedOn}
          onChangeText={set.receivedOn}
          placeholder="YYYY-MM-DD"
        />
        <FormField
          label="Lot / batch code"
          value={values.lotCode}
          onChangeText={set.lotCode}
          hint="From the supplier label, for traceability."
        />
        <FormField
          label="Use by / expiry"
          value={values.expiresOn}
          onChangeText={set.expiresOn}
          placeholder="YYYY-MM-DD (optional)"
        />
        <FormField
          label="Notes"
          value={values.notes}
          onChangeText={set.notes}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
});
