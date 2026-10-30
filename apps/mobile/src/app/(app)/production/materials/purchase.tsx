import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBusiness } from "@/business/useBusiness";
import { useMaterials } from "@/data/useMaterials";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import RecordPurchaseForm from "@/components/RecordPurchaseForm";

/** Adds stock and makes this the material's current price for recipes. */
export default function RecordPurchaseScreen() {
  const { ingredientId } = useLocalSearchParams<{ ingredientId?: string }>();
  const { selected } = useBusiness();
  const materials = useMaterials(selected?.id ?? null);

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
        <ErrorMessage error={materials.error} />
        {materials.data ? (
          <RecordPurchaseForm
            data={materials.data}
            ingredientId={ingredientId}
          />
        ) : materials.isPending ? (
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
