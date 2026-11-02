import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useCreateRecipe } from "@/data/useRecipes";
import { parseQuantity } from "@/lib/recipe-format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

export default function NewRecipeScreen() {
  const create = useCreateRecipe();
  const [name, setName] = useState("");
  const [yieldText, setYieldText] = useState("");
  const [yieldLabel, setYieldLabel] = useState("");

  function submit() {
    const yieldQuantity = parseQuantity(yieldText);
    if (!name.trim()) return Alert.alert("Add a name", "Enter a recipe name.");
    if (yieldQuantity == null || yieldQuantity <= 0) {
      return Alert.alert("Check the yield", "Enter how many one batch makes.");
    }
    create.mutate(
      { name, yieldQuantity, yieldLabel },
      {
        onSuccess: (result) => {
          if (!result.recipeId) return router.back();
          router.replace({
            pathname: "/production/recipes/[recipeId]",
            params: { recipeId: result.recipeId },
          });
        },
        onError: (error) => Alert.alert("Couldn't create", error.message),
      },
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Card title="New recipe">
        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Sourdough loaf, Dragon figurine"
        />
        <FormField
          label="One batch makes"
          value={yieldText}
          onChangeText={setYieldText}
          keyboardType="decimal-pad"
          placeholder="12"
        />
        <FormField
          label="Unit name"
          value={yieldLabel}
          onChangeText={setYieldLabel}
          placeholder="loaves, prints, jars"
        />
        <PrimaryButton
          label="Create recipe"
          loading={create.isPending}
          onPress={submit}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
});
