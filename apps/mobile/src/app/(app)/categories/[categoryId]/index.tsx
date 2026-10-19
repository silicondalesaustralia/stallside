import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useToken } from "@/auth/useAuth";
import { useCategory, useDeleteCategory } from "@/data/useCategories";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import CategorySettingsCard from "@/components/CategorySettingsCard";
import CategoryProductsCard from "@/components/CategoryProductsCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const token = useToken();
  const category = useCategory(categoryId);
  const remove = useDeleteCategory();
  const detail = category.data;

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

  function confirmDelete() {
    if (!detail) return;
    Alert.alert(
      `Delete “${detail.category.title}”?`,
      "Its products are kept; they just leave this category.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            remove.mutate(detail.category.id, {
              onSuccess: () => router.back(),
              onError: (error) =>
                Alert.alert("Couldn't delete category", error.message),
            }),
        },
      ],
    );
  }

  async function editOnWeb(path: string) {
    await openOnWeb(path, token);
    void category.refetch();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: detail.category.title }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <CategorySettingsCard
          key={detail.category.title}
          category={detail.category}
        />
        <CategoryProductsCard detail={detail} />
        <Pressable
          accessibilityRole="link"
          onPress={() => void editOnWeb(detail.webPath)}
          style={styles.web}
        >
          <Text style={styles.webLabel}>
            Edit description, image & SEO on the web
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={remove.isPending}
          onPress={confirmDelete}
          style={styles.web}
        >
          <Text style={styles.deleteLabel}>Delete category</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  web: { alignItems: "center", paddingVertical: spacing.sm },
  webLabel: { color: colors.brand, fontSize: 15, fontWeight: "600" },
  deleteLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
