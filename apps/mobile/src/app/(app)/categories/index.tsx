import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useCategories,
  useSaveCategoryOrder,
  useSetCategoryPublished,
} from "@/data/useCategories";
import { moveItem } from "@/lib/move-item";
import { openCategory } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import CategoryRow from "@/components/CategoryRow";
import NewCategoryForm from "@/components/NewCategoryForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function CategoriesScreen() {
  const categories = useCategories();
  const saveOrder = useSaveCategoryOrder();
  const setPublished = useSetCategoryPublished();
  const list = categories.data?.categories ?? [];

  function move(index: number, direction: -1 | 1) {
    saveOrder.mutate(
      { categories: moveItem(list, index, direction) },
      { onError: (error) => Alert.alert("Couldn't save order", error.message) },
    );
  }

  function togglePublished(id: string, isActive: boolean) {
    setPublished.mutate(
      { id, isActive },
      {
        onError: (error) =>
          Alert.alert("Couldn't update category", error.message),
      },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={list}
      keyExtractor={(category) => category.id}
      renderItem={({ item, index }) => (
        <CategoryRow
          category={item}
          isFirst={index === 0}
          isLast={index === list.length - 1}
          busy={saveOrder.isPending}
          onPress={openCategory}
          onMove={(direction) => move(index, direction)}
          onTogglePublished={togglePublished}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <NewCategoryForm />
          <Text style={styles.hint}>
            Categories with products show as links in your shop menu, in this
            order.
          </Text>
          <ErrorMessage error={categories.error} />
        </View>
      }
      ListEmptyComponent={
        categories.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>
            No categories yet. Add your first one above.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={categories.isRefetching}
          onRefresh={() => void categories.refetch()}
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
  hint: { color: colors.muted, fontSize: 13 },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
