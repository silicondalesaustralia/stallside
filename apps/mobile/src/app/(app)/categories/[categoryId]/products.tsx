import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCategory } from "@/data/useCategories";
import { useSetCategoryProducts } from "@/data/useCategoryProducts";
import { colors, spacing } from "@/lib/theme";
import CheckRow from "@/components/CheckRow";
import SearchInput from "@/components/SearchInput";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

/** Tick the products that belong in the category; newly ticked ones go last. */
export default function CategoryProductsPicker() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = useCategory(categoryId);
  const save = useSetCategoryProducts(categoryId);
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const [q, setQ] = useState("");
  const detail = category.data;
  const chosen = picked ?? new Set(detail?.products.map((p) => p.id) ?? []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = detail?.allProducts ?? [];
    return term
      ? all.filter((p) =>
          `${p.name} ${p.detail ?? ""}`.toLowerCase().includes(term),
        )
      : all;
  }, [detail, q]);

  function toggle(id: string) {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  function submit() {
    save.mutate([...chosen], {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert("Couldn't save products", error.message),
    });
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        {category.isPending ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <ErrorMessage error={category.error} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <SearchInput value={q} onChange={setQ} placeholder="Search products" />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CheckRow
            label={item.name}
            detail={item.detail}
            checked={chosen.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No products match.</Text>
        }
      />
      <View style={styles.footer}>
        <PrimaryButton
          label={`Save (${chosen.size} selected)`}
          loading={save.isPending}
          onPress={submit}
        />
      </View>
    </View>
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
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingBottom: spacing.sm },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
