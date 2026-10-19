import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useToken } from "@/auth/useAuth";
import { useBusiness } from "@/business/useBusiness";
import { usePreOrderPages, useSetPreOrderActive } from "@/data/usePreOrders";
import { openPreOrderPage } from "@/lib/navigation";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import PreOrderPageRow from "@/components/PreOrderPageRow";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function PreOrdersScreen() {
  const token = useToken();
  const { selected } = useBusiness();
  const pages = usePreOrderPages(selected?.id ?? null);
  const setActive = useSetPreOrderActive();

  function toggle(id: string, isActive: boolean) {
    setActive.mutate(
      { id, isActive },
      {
        onError: (error) =>
          Alert.alert("Couldn't update pre-order page", error.message),
      },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={pages.data?.pages ?? []}
      keyExtractor={(page) => page.id}
      renderItem={({ item }) => (
        <PreOrderPageRow
          page={item}
          onPress={openPreOrderPage}
          onToggle={toggle}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton
            label="New pre-order page"
            onPress={() =>
              void openOnWeb("/dashboard/pre-order-pages/new", token)
            }
          />
          <Text style={styles.hint}>
            Dates, products and payment are set up on the web.
          </Text>
          <ErrorMessage error={pages.error} />
        </View>
      }
      ListEmptyComponent={
        pages.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No pre-order pages yet. Create one, pick products, share the link.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={pages.isRefetching}
          onRefresh={() => void pages.refetch()}
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
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
