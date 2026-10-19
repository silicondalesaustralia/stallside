import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { ProductTab } from "@contracts/mobile/products";
import { useBusiness } from "@/business/useBusiness";
import { useProducts, useSetStock } from "@/data/useProducts";
import { useDebounced } from "@/lib/useDebounced";
import { colors, spacing } from "@/lib/theme";
import BusinessSwitcher from "@/components/BusinessSwitcher";
import ChipRow from "@/components/ChipRow";
import ProductRow from "@/components/ProductRow";
import ErrorMessage from "@/components/ErrorMessage";
import SearchInput from "@/components/SearchInput";

const TABS = [
  { value: "standard", label: "Standard" },
  { value: "preorder", label: "Pre-order" },
  { value: "draft", label: "Draft" },
  { value: "supplier", label: "Supplier" },
] as const satisfies readonly { value: ProductTab; label: string }[];

export default function ProductsScreen() {
  const { selected } = useBusiness();
  const [tab, setTab] = useState<ProductTab>("standard");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const products = useProducts(selected?.id ?? null, tab, q);
  const setStock = useSetStock();
  const savingId = setStock.isPending ? setStock.variables?.productId : undefined;

  function saveStock(productId: string, quantity: number) {
    setStock.mutate(
      { productId, quantity },
      { onError: (error) => Alert.alert("Couldn't save stock", error.message) },
    );
  }

  if (!selected) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Set up your first business on the web to add products.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={products.data?.products ?? []}
      keyExtractor={(product) => product.id}
      renderItem={({ item }) => (
        <ProductRow product={item} saving={savingId === item.id} onSaveStock={saveStock} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.bleed}>
            <BusinessSwitcher />
          </View>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, SKU or barcode" />
          <ChipRow options={TABS} value={tab} onChange={setTab} />
          <ErrorMessage error={products.error} />
        </View>
      }
      ListEmptyComponent={
        products.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>{q ? `No products match “${q}”.` : "No products here yet."}</Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={products.isRefetching}
          onRefresh={() => void products.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  bleed: { marginHorizontal: -spacing.md },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
