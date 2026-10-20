import { StyleSheet, Text, View } from "react-native";
import type { SupplierDetailResponse } from "@contracts/mobile/suppliers";
import { formatCents } from "@/lib/format";
import { supplierStatusLabel } from "@/lib/supplier-labels";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Props = { detail: SupplierDetailResponse };

/** Who the supplier is and where the money stands. */
export default function SupplierStatsCard({ detail }: Props) {
  const { supplier, currency } = detail;
  const stats = [
    { label: "Units added", value: String(detail.unitsAdded) },
    { label: "Units sold", value: String(detail.unitsSold) },
    { label: "On hand", value: String(detail.onHand) },
    { label: "You owe", value: formatCents(detail.owedCents, currency) },
    { label: "Paid", value: formatCents(detail.paidCents, currency) },
  ];
  return (
    <Card title={supplier.name}>
      <Text style={styles.meta}>
        {supplier.email} · {supplierStatusLabel(supplier.status)} ·{" "}
        {detail.standName}
      </Text>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.muted, fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  stat: {
    minWidth: "30%",
    flexGrow: 1,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  value: { color: colors.text, fontSize: 17, fontWeight: "700" },
  label: { color: colors.muted, fontSize: 12 },
});
