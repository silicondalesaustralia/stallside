import { StyleSheet, Text, View } from "react-native";
import type { SalesSummary } from "@contracts/mobile/home";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Props = {
  label: string;
  current: SalesSummary;
  previous: SalesSummary;
};

function changeText(current: number, previous: number): string | null {
  if (previous <= 0) return current > 0 ? "New sales vs prior period" : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "Same as prior period";
  return `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs prior period`;
}

export default function SalesHeadline({ label, current, previous }: Props) {
  const change = changeText(current.salesCents, previous.salesCents);
  const up = current.salesCents >= previous.salesCents;
  return (
    <Card>
      <Text style={styles.label}>Sales · {label}</Text>
      <Text style={styles.total}>{formatCents(current.salesCents, current.currency)}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>
          {current.orderCount} order{current.orderCount === 1 ? "" : "s"}
        </Text>
        {change ? <Text style={[styles.meta, up ? styles.up : styles.down]}>{change}</Text> : null}
      </View>
      <View style={styles.split}>
        <Text style={styles.splitText}>Card/online {formatCents(current.digitalCents, current.currency)}</Text>
        <Text style={styles.splitText}>Cash/transfer {formatCents(current.cashCents, current.currency)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  total: { color: colors.text, fontSize: 34, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: spacing.sm },
  meta: { color: colors.muted, fontSize: 14 },
  up: { color: colors.brand, fontWeight: "600" },
  down: { color: colors.danger, fontWeight: "600" },
  split: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: spacing.sm },
  splitText: { color: colors.text, fontSize: 13 },
});
