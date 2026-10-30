import { StyleSheet, Text } from "react-native";
import type { ProductionResponse } from "@contracts/mobile/production";
import type { BatchForm } from "@/lib/useBatchForm";
import { formatCents } from "@/lib/format";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import SwitchRow from "@/components/SwitchRow";

type Props = { data: ProductionResponse; form: BatchForm };

const NO_PRODUCT = "__none";

/** Same fields as "Record a batch" on the web Batches page. */
export default function BatchFormFields({ data, form }: Props) {
  const { values, set, recipe } = form;
  const productOptions = [
    { id: NO_PRODUCT, label: "No product (materials only)" },
    ...data.products.map((p) => ({ id: p.id, label: p.name })),
  ];
  return (
    <>
      <Card title="What you made">
        <PickerField
          label="Recipe"
          options={data.recipes.map((r) => ({ id: r.id, label: r.name }))}
          selected={values.recipeId ? [values.recipeId] : []}
          multiple={false}
          placeholder="Choose a recipe"
          onChange={(ids) => ids[0] && set.recipeId(ids[0])}
        />
        <FormField
          label="Batches made"
          value={values.count}
          onChangeText={set.count}
          keyboardType="decimal-pad"
          hint={
            recipe
              ? `1 batch makes ${recipe.yieldQuantity} ${recipe.yieldLabel}. Use 0.5 for half a batch.`
              : undefined
          }
        />
        <PickerField
          label="Adds stock to"
          options={productOptions}
          selected={[values.productId ?? NO_PRODUCT]}
          multiple={false}
          placeholder="Choose a product"
          onChange={(ids) =>
            set.productId(ids[0] && ids[0] !== NO_PRODUCT ? ids[0] : null)
          }
        />
        {values.productId ? (
          <FormField
            label="Units made"
            value={values.units}
            onChangeText={set.units}
            keyboardType="number-pad"
            hint="Worked out from the recipe; change it if the run gave more or fewer."
          />
        ) : null}
        <Text style={styles.estimate}>
          Estimated cost {formatCents(form.costCents, data.currency)}
          {values.productId ? " plus packaging" : ""}
        </Text>
      </Card>
      <Card title="Batch details">
        <FormField
          label="Made on"
          value={values.madeOn}
          onChangeText={set.madeOn}
          placeholder="YYYY-MM-DD"
        />
        <FormField
          label="Best before"
          value={values.bestBefore}
          onChangeText={set.bestBefore}
          placeholder="YYYY-MM-DD (optional)"
        />
        <FormField
          label="Batch code"
          value={values.batchCode}
          onChangeText={set.batchCode}
          autoCapitalize="characters"
          placeholder="Automatic"
        />
        <FormField
          label="Notes"
          value={values.notes}
          onChangeText={set.notes}
          multiline
        />
        {values.productId ? (
          <SwitchRow
            label="Update product cost"
            hint="Sets the product's unit cost from this batch."
            value={values.updateCost}
            onChange={set.updateCost}
          />
        ) : null}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  estimate: { color: colors.muted, fontSize: 13 },
});
