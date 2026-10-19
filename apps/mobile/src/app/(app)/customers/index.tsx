import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCustomers } from "@/data/useCustomers";
import { useDebounced } from "@/lib/useDebounced";
import { colors, spacing } from "@/lib/theme";
import CustomerRow from "@/components/CustomerRow";
import ErrorMessage from "@/components/ErrorMessage";
import SearchInput from "@/components/SearchInput";

export default function CustomersScreen() {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const customers = useCustomers(q);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={customers.data?.customers ?? []}
      keyExtractor={(customer) => customer.id}
      renderItem={({ item }) => <CustomerRow customer={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or phone" />
          <ErrorMessage error={customers.error} />
        </View>
      }
      ListEmptyComponent={
        customers.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            {q
              ? "No customers match that search."
              : "No customers yet. They appear after a paid order with a receipt email."}
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={customers.isRefetching}
          onRefresh={() => void customers.refetch()}
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
