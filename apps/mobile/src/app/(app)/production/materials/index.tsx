import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useMaterials } from "@/data/useMaterials";
import { colors, spacing } from "@/lib/theme";
import ChipRow from "@/components/ChipRow";
import ErrorMessage from "@/components/ErrorMessage";
import MaterialRow from "@/components/MaterialRow";
import PrimaryButton from "@/components/PrimaryButton";
import ScanInvoiceCard from "@/components/ScanInvoiceCard";

type Tab = "all" | "INGREDIENT" | "PACKAGING";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "INGREDIENT", label: "Ingredients" },
  { value: "PACKAGING", label: "Packaging" },
];

export default function MaterialsScreen() {
  const { selected } = useBusiness();
  const materials = useMaterials(selected?.id ?? null);
  const [tab, setTab] = useState<Tab>("all");
  const all = materials.data?.materials ?? [];
  const shown = tab === "all" ? all : all.filter((m) => m.kind === tab);
  const toReorder = all.filter(
    (m) => m.status === "reorder" || m.status === "out",
  ).length;
  const hasActive = all.some((m) => m.status !== "archived");

  const header = (
    <View style={styles.header}>
      {selected ? (
        <Text style={styles.subtitle}>
          {selected.name}
          {toReorder ? ` · ${toReorder} to reorder` : ""}
        </Text>
      ) : null}
      <ErrorMessage error={materials.error} />
      {selected ? <ScanInvoiceCard standId={selected.id} /> : null}
      {hasActive ? (
        <PrimaryButton
          label="Record a purchase by hand"
          onPress={() => router.push("/production/materials/purchase")}
        />
      ) : null}
      {all.length > 0 ? (
        <ChipRow options={TABS} value={tab} onChange={setTab} />
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => (
        <MaterialRow
          material={item}
          onPress={(id) =>
            router.push({
              pathname: "/production/materials/[ingredientId]",
              params: { ingredientId: id },
            })
          }
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        materials.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No materials yet. Scan an invoice to add them, or add them on the
            web.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={materials.isRefetching}
          onRefresh={() => void materials.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  subtitle: { color: colors.muted, fontSize: 14 },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
