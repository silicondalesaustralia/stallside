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
import { useAdvanceCollection, useCollections } from "@/data/useCollections";
import { colors, spacing } from "@/lib/theme";
import CollectionDayCard from "@/components/CollectionDayCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function CollectionsScreen() {
  const { selected } = useBusiness();
  const collections = useCollections(selected?.id ?? null);
  const advance = useAdvanceCollection();
  const pendingId = advance.isPending ? advance.variables : undefined;

  function onAdvance(orderId: string) {
    advance.mutate(orderId, {
      onError: (error) => Alert.alert("Couldn't update", error.message),
    });
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={collections.data?.days ?? []}
      keyExtractor={(day) => day.key}
      renderItem={({ item }) => (
        <CollectionDayCard
          day={item}
          pendingId={pendingId}
          onAdvance={onAdvance}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          {selected ? (
            <Text style={styles.subtitle}>{selected.name}</Text>
          ) : null}
          <ErrorMessage error={collections.error} />
        </View>
      }
      ListEmptyComponent={
        collections.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No paid pre-orders or subscription cycles upcoming or in the last 14
            days.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={collections.isRefetching}
          onRefresh={() => void collections.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { gap: spacing.xs },
  subtitle: { color: colors.muted, fontSize: 14 },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
