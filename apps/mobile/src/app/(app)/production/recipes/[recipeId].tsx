import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useSetRecipeActive } from "@/data/useRecipeMutations";
import { useRecipeDetail } from "@/data/useRecipes";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";
import RecipeCostCard from "@/components/RecipeCostCard";
import RecipeLinesCard from "@/components/RecipeLinesCard";
import RecipeProductsCard from "@/components/RecipeProductsCard";
import RecipeSettingsForm from "@/components/RecipeSettingsForm";

export default function RecipeScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const { selected } = useBusiness();
  const detail = useRecipeDetail(selected?.id ?? null, recipeId);
  const setActive = useSetRecipeActive(recipeId);
  const data = detail.data;
  const recipe = data?.recipe;

  function toggleActive() {
    if (!recipe) return;
    setActive.mutate(!recipe.isActive, {
      onSuccess: (result) => Alert.alert(result.message),
      onError: (error) => Alert.alert("Couldn't update", error.message),
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={detail.isRefetching}
          onRefresh={() => void detail.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <Stack.Screen options={{ title: recipe?.name ?? "Recipe" }} />
      <ErrorMessage error={detail.error} />
      {detail.isLoading ? <ActivityIndicator color={colors.brand} /> : null}
      {data && recipe ? (
        <>
          <Text style={styles.muted}>
            Makes {recipe.yieldQuantity} {recipe.yieldLabel}
            {recipe.isActive ? "" : " · archived"}
          </Text>
          <PrimaryButton
            label="Make a batch"
            onPress={() =>
              router.push({
                pathname: "/production/new",
                params: { recipeId: recipe.id },
              })
            }
          />
          <RecipeLinesCard data={data} />
          <RecipeCostCard data={data} />
          <RecipeProductsCard data={data} />
          <RecipeSettingsForm key={JSON.stringify(recipe)} data={data} />
          <Text
            style={styles.archive}
            onPress={setActive.isPending ? undefined : toggleActive}
          >
            {recipe.isActive ? "Archive this recipe" : "Restore this recipe"}
          </Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  muted: { color: colors.muted, fontSize: 14 },
  archive: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
