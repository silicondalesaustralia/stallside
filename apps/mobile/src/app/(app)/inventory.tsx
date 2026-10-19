import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { InventoryRow } from "@contracts/mobile/inventory";
import { useBusiness } from "@/business/useBusiness";
import { useInventory } from "@/data/useInventory";
import { useSetStock } from "@/data/useProducts";
import { useDebounced } from "@/lib/useDebounced";
import { colors, spacing } from "@/lib/theme";
import ChipRow from "@/components/ChipRow";
import ErrorMessage from "@/components/ErrorMessage";
import InventoryItemRow from "@/components/InventoryItemRow";
import InventorySummaryGrid from "@/components/InventorySummaryGrid";
import SearchInput from "@/components/SearchInput";

type Filter = "all" | "low" | "out" | "soon" | "incoming";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "out", label: "Out" },
  { value: "soon", label: "Runs out soon" },
  { value: "incoming", label: "Incoming" },
] as const satisfies readonly { value: Filter; label: string }[];

function matches(row: InventoryRow, filter: Filter): boolean {
  if (filter === "low") return row.stockStatus === "low";
  if (filter === "out") return row.stockStatus === "out";
  if (filter === "soon") return row.daysCover != null && row.daysCover <= 7;
  if (filter === "incoming") return row.incoming > 0;
  return true;
}

export default function InventoryScreen() {
  const { selected } = useBusiness();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const inventory = useInventory(selected?.id ?? null, q);
  const setStock = useSetStock();
  const savingId = setStock.isPending ? setStock.variables?.productId : undefined;
  const rows = (inventory.data?.rows ?? []).filter((row) => matches(row, filter));

  function saveStock(productId: string, quantity: number) {
    setStock.mutate(
      { productId, quantity },
      { onError: (error) => Alert.alert("Couldn't save stock", error.message) },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={rows}
      keyExtractor={(row) => row.id}
      renderItem={({ item }) => (
        <InventoryItemRow row={item} saving={savingId === item.id} onSaveStock={saveStock} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          {inventory.data ? <InventorySummaryGrid summary={inventory.data.summary} /> : null}
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, SKU or barcode" />
          <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
          <ErrorMessage error={inventory.error} />
        </View>
      }
      ListEmptyComponent={
        inventory.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>Nothing to show for this filter.</Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={inventory.isRefetching}
          onRefresh={() => void inventory.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
