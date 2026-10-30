import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ProfitRange } from "@contracts/mobile/profit";
import { useBusiness } from "@/business/useBusiness";
import { useProfit } from "@/data/useProfit";
import { colors, spacing } from "@/lib/theme";
import ChipRow from "@/components/ChipRow";
import ErrorMessage from "@/components/ErrorMessage";
import ProfitProductRow from "@/components/ProfitProductRow";
import ProfitStatementCards from "@/components/ProfitStatementCards";

const RANGES: { value: ProfitRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
];

export default function ProfitScreen() {
  const { selected } = useBusiness();
  const [range, setRange] = useState<ProfitRange>("30d");
  const profit = useProfit(selected?.id ?? null, range);
  const p = profit.data;

  const header = (
    <View style={styles.header}>
      <ChipRow options={RANGES} value={range} onChange={setRange} />
      {p ? (
        <Text style={styles.subtitle}>
          {p.rangeLabel} · {p.orders} paid order(s)
          {selected ? ` · ${selected.name}` : ""}
        </Text>
      ) : null}
      <ErrorMessage error={profit.error} />
      {p ? <ProfitStatementCards p={p} /> : null}
      {p ? <Text style={styles.section}>By product</Text> : null}
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={p?.products ?? []}
      keyExtractor={(row) => row.productId}
      renderItem={({ item }) => (
        <ProfitProductRow product={item} currency={p?.currency ?? "AUD"} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        profit.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : p ? (
          <Text style={styles.empty}>No sales in this period.</Text>
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={profit.isRefetching}
          onRefresh={() => void profit.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  subtitle: { color: colors.muted, fontSize: 14 },
  section: { color: colors.text, fontSize: 16, fontWeight: "700" },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
