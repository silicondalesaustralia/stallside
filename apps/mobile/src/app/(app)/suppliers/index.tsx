import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { useSuppliers } from "@/data/useSuppliers";
import { openSupplier } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import SupplierRow from "@/components/SupplierRow";
import InviteSupplierCard from "@/components/InviteSupplierCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function SuppliersScreen() {
  const { selected } = useBusiness();
  const suppliers = useSuppliers(selected?.id ?? null);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={suppliers.data?.suppliers ?? []}
      keyExtractor={(supplier) => supplier.id}
      renderItem={({ item }) => (
        <SupplierRow supplier={item} onPress={openSupplier} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          {selected ? <InviteSupplierCard standId={selected.id} /> : null}
          <ErrorMessage error={suppliers.error} />
        </View>
      }
      ListEmptyComponent={
        suppliers.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No suppliers yet. Invite someone who brings stock to your stall.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={suppliers.isRefetching}
          onRefresh={() => void suppliers.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg * 2,
  },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
