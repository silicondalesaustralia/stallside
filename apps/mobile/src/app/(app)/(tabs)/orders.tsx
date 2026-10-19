import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { useOrders } from "@/data/useOrders";
import { useMe } from "@/data/useMe";
import { colors, spacing } from "@/lib/theme";
import OrderRow from "@/components/OrderRow";
import BusinessSwitcher from "@/components/BusinessSwitcher";
import ErrorMessage from "@/components/ErrorMessage";

export default function OrdersScreen() {
  const me = useMe();
  const { selected } = useBusiness();
  const orders = useOrders(selected?.id ?? null);
  const rows = orders.data?.pages.flatMap((page) => page.orders) ?? [];

  if (me.isPending || (selected && orders.isPending)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!selected) {
    return (
      <View style={styles.center}>
        <ErrorMessage error={me.error} />
        {!me.error ? (
          <Text style={styles.empty}>Set up your first business on vendl.app to start taking orders.</Text>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={rows}
      keyExtractor={(order) => order.id}
      renderItem={({ item }) => <OrderRow order={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <BusinessSwitcher />
          <ErrorMessage error={orders.error} />
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No orders yet for {selected.name}.</Text>}
      ListFooterComponent={
        orders.isFetchingNextPage ? <ActivityIndicator color={colors.brand} /> : undefined
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (orders.hasNextPage && !orders.isFetchingNextPage) void orders.fetchNextPage();
      }}
      refreshControl={
        <RefreshControl
          refreshing={orders.isRefetching && !orders.isFetchingNextPage}
          onRefresh={() => void orders.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { marginHorizontal: -spacing.md, gap: spacing.sm },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
