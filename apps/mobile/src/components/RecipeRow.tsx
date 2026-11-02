import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RecipeSummary } from "@contracts/mobile/recipes";
import { formatCents } from "@/lib/format";
import { formatPercent } from "@/lib/recipe-format";
import { colors, spacing } from "@/lib/theme";

type Props = {
  recipe: RecipeSummary;
  currency: string;
  onPress: (id: string) => void;
};

function status(recipe: RecipeSummary): { label: string; color: string } {
  if (!recipe.isActive) return { label: "Archived", color: colors.muted };
  if (recipe.needsAttention)
    return { label: "Needs attention", color: "#b54708" };
  return { label: "Active", color: colors.brand };
}

/** Name, yield, costs and product margins, like a row on the web Recipes table. */
export default function RecipeRow({ recipe, currency, onPress }: Props) {
  const pill = status(recipe);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(recipe.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.body}>
          <Text style={styles.name}>{recipe.name}</Text>
          <Text style={styles.meta}>
            Makes {recipe.yieldQuantity} {recipe.yieldLabel} ·{" "}
            {recipe.lineCount} line(s)
          </Text>
        </View>
        <View style={styles.side}>
          <Text style={styles.cost}>
            {formatCents(recipe.unitCostCents, currency)}
          </Text>
          <Text style={styles.meta}>per unit</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        Batch {formatCents(recipe.batchCostCents, currency)} ·{" "}
        <Text style={[styles.status, { color: pill.color }]}>{pill.label}</Text>
      </Text>
      {recipe.products.map((p) => (
        <Text key={p.productId} style={styles.meta}>
          {p.name} · {formatCents(p.unitCostCents, p.currency)} ·{" "}
          <Text
            style={
              p.marginPercent != null && p.marginPercent < 0
                ? styles.loss
                : undefined
            }
          >
            {formatPercent(p.marginPercent)}
          </Text>
        </Text>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 4,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  side: { alignItems: "flex-end" },
  cost: { color: colors.text, fontSize: 15, fontWeight: "600" },
  status: { fontWeight: "700" },
  loss: { color: colors.danger, fontWeight: "700" },
});
