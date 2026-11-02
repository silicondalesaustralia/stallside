import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  compatibleMaterialUnits,
  type MaterialUnit,
} from "@contracts/mobile/material-units";
import type { RecipeDetailResponse } from "@contracts/mobile/recipes";
import { useAddRecipeLine } from "@/data/useRecipeMutations";
import { parseQuantity } from "@/lib/recipe-format";
import { colors, spacing } from "@/lib/theme";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import PrimaryButton from "@/components/PrimaryButton";
import UnitChips from "@/components/UnitChips";

export default function AddRecipeLineForm({
  data,
}: {
  data: RecipeDetailResponse;
}) {
  const add = useAddRecipeLine(data.recipe.id);
  /** `mat:<id>` or `rec:<id>`, like the web "Add" select. */
  const [source, setSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<MaterialUnit>("G");
  const [kind, id = ""] = source.split(":");
  const material =
    kind === "mat" ? data.materials.find((m) => m.id === id) : undefined;
  const subRecipe =
    kind === "rec" ? data.subRecipes.find((r) => r.id === id) : undefined;
  const units = material ? compatibleMaterialUnits(material.baseUnit) : [];

  const options = [
    ...data.materials.map((m) => ({ id: `mat:${m.id}`, label: m.name })),
    ...data.subRecipes.map((r) => ({
      id: `rec:${r.id}`,
      label: `${r.name} (sub-recipe)`,
    })),
  ];

  function pick(next: string) {
    setSource(next);
    const picked = data.materials.find((m) => `mat:${m.id}` === next);
    if (picked) setUnit(picked.baseUnit);
  }

  function submit() {
    const amount = parseQuantity(quantity);
    if (!material && !subRecipe) {
      return Alert.alert("Choose one", "Choose a material or sub-recipe.");
    }
    if (amount == null || amount <= 0) {
      return Alert.alert("Check the quantity", "Enter a quantity.");
    }
    add.mutate(
      {
        kind: material ? "material" : "recipe",
        sourceId: id,
        quantity: amount,
        unit: material ? unit : null,
      },
      {
        onSuccess: () => {
          setSource("");
          setQuantity("");
        },
        onError: (error) => Alert.alert("Couldn't add", error.message),
      },
    );
  }

  return (
    <View style={styles.form}>
      <PickerField
        label="Add"
        options={options}
        selected={source ? [source] : []}
        multiple={false}
        placeholder="Choose a material or sub-recipe…"
        onChange={(ids) => pick(ids[0] ?? "")}
      />
      <FormField
        label={subRecipe ? `Quantity (${subRecipe.yieldLabel})` : "Quantity"}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />
      {material ? (
        <UnitChips units={units} value={unit} onChange={setUnit} />
      ) : null}
      {options.length === 0 ? (
        <Text style={styles.muted}>
          Add materials first under Production → Materials.
        </Text>
      ) : null}
      <PrimaryButton
        label="Add line"
        loading={add.isPending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  muted: { color: colors.muted, fontSize: 13 },
});
