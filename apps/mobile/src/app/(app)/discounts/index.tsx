import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { useDiscounts, useSetDiscountActive } from "@/data/useDiscounts";
import { openDiscount } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import DiscountRow from "@/components/DiscountRow";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function DiscountsScreen() {
  const { selected } = useBusiness();
  const discounts = useDiscounts(selected?.id ?? null);
  const setActive = useSetDiscountActive();

  function toggle(id: string, isActive: boolean) {
    setActive.mutate(
      { id, isActive },
      {
        onError: (error) =>
          Alert.alert("Couldn't update discount", error.message),
      },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={discounts.data?.discounts ?? []}
      keyExtractor={(discount) => discount.id}
      renderItem={({ item }) => (
        <DiscountRow discount={item} onPress={openDiscount} onToggle={toggle} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton
            label="New discount code"
            disabled={!selected}
            onPress={() => openDiscount("new")}
          />
          <ErrorMessage error={discounts.error} />
        </View>
      }
      ListEmptyComponent={
        discounts.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>No discount codes yet.</Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={discounts.isRefetching}
          onRefresh={() => void discounts.refetch()}
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
