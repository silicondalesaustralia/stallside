import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useRecipes } from "@/data/useRecipes";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";
import RecipeRow from "@/components/RecipeRow";

export default function RecipesScreen() {
  const { selected } = useBusiness();
  const recipes = useRecipes(selected?.id ?? null);
  const data = recipes.data;

  const header = (
    <View style={styles.header}>
      <Text style={styles.subtitle}>
        What goes into each batch, what it costs, and your margin.
      </Text>
      <ErrorMessage error={recipes.error} />
      <PrimaryButton
        label="New recipe"
        onPress={() => router.push("/production/recipes/new")}
      />
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data?.recipes ?? []}
      keyExtractor={(recipe) => recipe.id}
      renderItem={({ item }) => (
        <RecipeRow
          recipe={item}
          currency={data?.currency ?? "AUD"}
          onPress={(id) =>
            router.push({
              pathname: "/production/recipes/[recipeId]",
              params: { recipeId: id },
            })
          }
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        recipes.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No recipes yet. A recipe (or parts list) says what one batch uses
            and how many it makes.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={recipes.isRefetching}
          onRefresh={() => void recipes.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { gap: spacing.sm },
  subtitle: { color: colors.muted, fontSize: 14 },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
