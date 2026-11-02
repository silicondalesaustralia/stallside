import { StyleSheet, Text, View } from "react-native";
import type { RecipeDetailResponse } from "@contracts/mobile/recipes";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Props = { data: RecipeDetailResponse };

/** Batch cost breakdown, same rows as the web "Batch cost" card. */
export default function RecipeCostCard({ data }: Props) {
  const { cost, recipe, currency } = data;
  const rows: [string, number, boolean][] = [
    ["Materials (incl. waste)", cost.materialCents, false],
    ["Labour", cost.labourCents, false],
    ["Overhead", cost.overheadCents, false],
    ["Batch total", cost.totalCents, true],
    [
      `Per unit (${recipe.yieldQuantity} ${recipe.yieldLabel} per batch)`,
      cost.unitCents,
      true,
    ],
  ];
  return (
    <Card title="Batch cost">
      {rows.map(([label, cents, strong]) => (
        <View key={label} style={styles.row}>
          <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
          <Text style={[styles.value, strong && styles.strong]}>
            {formatCents(cents, currency)}
          </Text>
        </View>
      ))}
      {cost.problems.map((problem) => (
        <Text key={problem} style={styles.problem}>
          • {problem}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 4,
  },
  label: { flex: 1, color: colors.text, fontSize: 14 },
  value: { color: colors.text, fontSize: 14 },
  strong: { fontWeight: "700" },
  problem: { color: colors.danger, fontSize: 12 },
});
