import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { RecipeDetailResponse } from "@contracts/mobile/recipes";
import { useLinkRecipeProduct } from "@/data/useRecipeMutations";
import { parseQuantity } from "@/lib/recipe-format";
import { colors, spacing } from "@/lib/theme";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import PrimaryButton from "@/components/PrimaryButton";

/** Links one of this business's products to the recipe. */
export default function LinkRecipeProductForm({
  data,
}: {
  data: RecipeDetailResponse;
}) {
  const link = useLinkRecipeProduct(data.recipe.id);
  const [productId, setProductId] = useState("");
  const [perProduct, setPerProduct] = useState("1");

  function submit() {
    const yieldUnitsPerProduct = parseQuantity(perProduct);
    if (!productId)
      return Alert.alert("Choose a product", "Pick a product first.");
    if (yieldUnitsPerProduct == null || yieldUnitsPerProduct <= 0) {
      return Alert.alert(
        "Check the amount",
        "Enter how many recipe units go in one product.",
      );
    }
    link.mutate(
      { productId, yieldUnitsPerProduct },
      {
        onSuccess: () => {
          setProductId("");
          setPerProduct("1");
        },
        onError: (error) => Alert.alert("Couldn't link", error.message),
      },
    );
  }

  return (
    <View style={styles.form}>
      <PickerField
        label="Product made from this recipe"
        options={data.linkable.map((p) => ({ id: p.id, label: p.name }))}
        selected={productId ? [productId] : []}
        multiple={false}
        placeholder="Choose…"
        onChange={(ids) => setProductId(ids[0] ?? "")}
      />
      <FormField
        label={`${data.recipe.yieldLabel} per product`}
        value={perProduct}
        onChangeText={setPerProduct}
        keyboardType="decimal-pad"
      />
      <Text style={styles.hint}>
        e.g. the recipe makes 12 cookies and the product is a box of 6, so enter
        6.
      </Text>
      <PrimaryButton
        label="Link product"
        loading={link.isPending}
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
  hint: { color: colors.muted, fontSize: 12 },
});
