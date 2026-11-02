import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type {
  RecipeDetailResponse,
  RecipeLineDto,
} from "@contracts/mobile/recipes";
import { useRemoveRecipeLine } from "@/data/useRecipeMutations";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import AddRecipeLineForm from "@/components/AddRecipeLineForm";
import Card from "@/components/Card";

/** What one batch uses, with remove and add. */
export default function RecipeLinesCard({
  data,
}: {
  data: RecipeDetailResponse;
}) {
  const remove = useRemoveRecipeLine(data.recipe.id);

  function confirmRemove(line: RecipeLineDto) {
    Alert.alert(
      `Remove ${line.name}?`,
      "The batch cost updates straight away.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            remove.mutate(line.id, {
              onError: (error) => Alert.alert("Couldn't remove", error.message),
            }),
        },
      ],
    );
  }

  function costLabel(line: RecipeLineDto): string {
    if (line.costCents != null)
      return formatCents(line.costCents, data.currency);
    return line.kind === "recipe" ? "see sub-recipe" : "—";
  }

  return (
    <Card title="What one batch uses">
      {data.lines.length === 0 ? (
        <Text style={styles.muted}>
          No lines yet. Add what one batch uses below.
        </Text>
      ) : null}
      {data.lines.map((line) => (
        <View key={line.id} style={styles.row}>
          <Pressable
            style={styles.body}
            disabled={!line.recipeId}
            onPress={() =>
              line.recipeId &&
              router.push({
                pathname: "/production/recipes/[recipeId]",
                params: { recipeId: line.recipeId },
              })
            }
          >
            <Text style={[styles.name, line.recipeId && styles.link]}>
              {line.name}
            </Text>
            <Text style={styles.muted}>
              {line.quantityLabel} · {costLabel(line)}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={remove.isPending}
            onPress={() => confirmRemove(line)}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}
      <AddRecipeLineForm data={data} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 14, fontWeight: "600" },
  link: { textDecorationLine: "underline" },
  muted: { color: colors.muted, fontSize: 13 },
  remove: { color: colors.danger, fontSize: 14, fontWeight: "600" },
});
