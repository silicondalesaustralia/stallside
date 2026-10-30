import { StyleSheet, Text, View } from "react-native";
import type { ProfitProduct } from "@contracts/mobile/profit";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

type Props = { product: ProfitProduct; currency: string };

function margin(revenue: number, profit: number): string {
  return revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : "—";
}

/** Units, revenue, cost, profit and margin for one product, like the web By product table. */
export default function ProfitProductRow({ product, currency }: Props) {
  const profit = product.revenueCents - product.costCents;
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.meta}>
          {product.units} sold · {formatCents(product.revenueCents, currency)}{" "}
          revenue · {formatCents(product.costCents, currency)} cost
        </Text>
        {product.unknownCostUnits > 0 ? (
          <Text style={styles.warn}>
            {product.unknownCostUnits} unit(s) without a cost. Set one on the
            product or record a batch.
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>
        <Text style={[styles.profit, profit < 0 && styles.negative]}>
          {formatCents(profit, currency)}
        </Text>
        <Text style={styles.meta}>{margin(product.revenueCents, profit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  warn: { color: "#b54708", fontSize: 12, fontWeight: "600" },
  side: { alignItems: "flex-end", gap: 2 },
  profit: { color: colors.text, fontSize: 15, fontWeight: "700" },
  negative: { color: colors.danger },
});
