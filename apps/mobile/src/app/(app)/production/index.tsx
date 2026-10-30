import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import type { ProductionBatchDto } from "@contracts/mobile/production";
import { useBusiness } from "@/business/useBusiness";
import { useToken } from "@/auth/useAuth";
import { useProduction, useUndoBatch } from "@/data/useProduction";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import BatchRow from "@/components/BatchRow";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function ProductionScreen() {
  const { selected } = useBusiness();
  const token = useToken();
  const production = useProduction(selected?.id ?? null);
  const undo = useUndoBatch();
  const data = production.data;
  const undoingId = undo.isPending ? undo.variables : undefined;

  function confirmUndo(batch: ProductionBatchDto) {
    Alert.alert(
      `Undo batch ${batch.batchCode}?`,
      "Its materials go back into stock and its units come off the product.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Undo batch",
          style: "destructive",
          onPress: () =>
            undo.mutate(batch.id, {
              onError: (error) => Alert.alert("Couldn't undo", error.message),
            }),
        },
      ],
    );
  }

  const header = (
    <View style={styles.header}>
      {selected ? <Text style={styles.subtitle}>{selected.name}</Text> : null}
      <ErrorMessage error={production.error} />
      {data && data.lowMaterials.length > 0 ? (
        <Text style={styles.low}>
          Reorder soon: {data.lowMaterials.join(", ")}.
        </Text>
      ) : null}
      {data && data.recipes.length > 0 ? (
        <PrimaryButton
          label="Record a batch"
          onPress={() => router.push("/production/new")}
        />
      ) : null}
      {data && data.recipes.length === 0 ? (
        <Text style={styles.empty}>
          Add your materials and build a recipe on the web first, then record
          batches here.
        </Text>
      ) : null}
      <Text
        style={styles.link}
        onPress={() => router.push("/production/materials")}
      >
        Materials & invoice scanning
      </Text>
      <Text
        style={styles.link}
        onPress={() => void openOnWeb("/dashboard/production/recipes", token)}
      >
        Recipes on the web
      </Text>
      {data && data.batches.length > 0 ? (
        <Text style={styles.section}>Recent batches</Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data?.batches ?? []}
      keyExtractor={(batch) => batch.id}
      renderItem={({ item }) => (
        <BatchRow
          batch={item}
          currency={data?.currency ?? "AUD"}
          undoing={undoingId === item.id}
          onUndo={confirmUndo}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        production.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : data && data.recipes.length > 0 ? (
          <Text style={styles.empty}>
            No batches yet. Record one each time you bake, print or make a run.
          </Text>
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={production.isRefetching}
          onRefresh={() => void production.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { gap: spacing.sm },
  subtitle: { color: colors.muted, fontSize: 14 },
  low: {
    color: colors.danger,
    backgroundColor: "#fdecea",
    borderRadius: 12,
    padding: spacing.sm + 4,
    fontSize: 14,
  },
  link: { color: colors.brand, fontSize: 14, fontWeight: "600" },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
