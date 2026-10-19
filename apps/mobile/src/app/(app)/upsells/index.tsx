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
import { useSetUpsellActive, useUpsells } from "@/data/useUpsells";
import { openUpsell } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import UpsellRow from "@/components/UpsellRow";
import UpsellExtrasCard from "@/components/UpsellExtrasCard";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function UpsellsScreen() {
  const { selected } = useBusiness();
  const upsells = useUpsells(selected?.id ?? null);
  const setActive = useSetUpsellActive();

  function toggle(id: string, isActive: boolean) {
    setActive.mutate(
      { id, isActive },
      {
        onError: (error) =>
          Alert.alert("Couldn't update upsell", error.message),
      },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={upsells.data?.upsells ?? []}
      keyExtractor={(upsell) => upsell.id}
      renderItem={({ item }) => (
        <UpsellRow upsell={item} onPress={openUpsell} onToggle={toggle} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton label="New upsell" onPress={() => openUpsell("new")} />
          <Text style={styles.hint}>
            Offer an extra item in the cart: everywhere, or for some categories
            or products.
          </Text>
          <ErrorMessage error={upsells.error} />
        </View>
      }
      ListEmptyComponent={
        upsells.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>No cart upsells yet.</Text>
        )
      }
      ListFooterComponent={
        upsells.data ? <UpsellExtrasCard data={upsells.data} /> : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={upsells.isRefetching}
          onRefresh={() => void upsells.refetch()}
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
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
