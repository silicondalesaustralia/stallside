import { StyleSheet, View } from "react-native";
import type { InventorySummary } from "@contracts/mobile/inventory";
import { formatCents } from "@/lib/format";
import { spacing } from "@/lib/theme";
import StatTile from "@/components/StatTile";

export default function InventorySummaryGrid({ summary }: { summary: InventorySummary }) {
  return (
    <View style={styles.grid}>
      <StatTile label="Low stock" value={String(summary.low)} warn={summary.low > 0} />
      <StatTile label="Out of stock" value={String(summary.out)} warn={summary.out > 0} />
      <StatTile label="Runs out ≤ 7 days" value={String(summary.runningOut)} hint="At 30-day sale rate" />
      <StatTile label="Sold (30 days)" value={String(summary.sold30)} hint="units" />
      <StatTile
        label="Stock value (retail)"
        value={formatCents(summary.retailValueCents, summary.currency)}
      />
      <StatTile
        label="Stock value (cost)"
        value={formatCents(summary.costValueCents, summary.currency)}
        hint={summary.missingCost > 0 ? `${summary.missingCost} without a cost` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
