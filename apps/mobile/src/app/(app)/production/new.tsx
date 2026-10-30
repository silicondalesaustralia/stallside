import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useProduction } from "@/data/useProduction";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import RecordBatchForm from "@/components/RecordBatchForm";

/** Takes the recipe's materials out of stock and adds the finished units to the product. */
export default function RecordBatchScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { selected } = useBusiness();
  const production = useProduction(selected?.id ?? null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage error={production.error} />
        {production.data && selected ? (
          <RecordBatchForm
            data={production.data}
            standId={selected.id}
            recipeId={recipeId}
          />
        ) : production.isPending ? (
          <ActivityIndicator color={colors.brand} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
});
