import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { MaterialsResponse } from "@contracts/mobile/materials";
import { useBusiness } from "@/business/useBusiness";
import { useMaterials, useRecordPurchase } from "@/data/useMaterials";
import { usePurchaseForm } from "@/lib/usePurchaseForm";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";
import PurchaseFormFields from "@/components/PurchaseFormFields";

function PurchaseForm({
  data,
  ingredientId,
}: {
  data: MaterialsResponse;
  ingredientId?: string;
}) {
  const active = data.materials.filter((m) => m.status !== "archived");
  const form = usePurchaseForm(active, data.today, ingredientId);
  const record = useRecordPurchase();

  function submit() {
    const problem = form.problem();
    if (problem) {
      Alert.alert("Check the purchase", problem);
      return;
    }
    record.mutate(form.body(), {
      onSuccess: (result) => {
        Alert.alert("Recorded", result.message);
        router.back();
      },
      onError: (error) => Alert.alert("Couldn't record", error.message),
    });
  }

  return (
    <>
      <PurchaseFormFields
        materials={active}
        form={form}
        fixedMaterial={Boolean(ingredientId)}
      />
      <PrimaryButton
        label="Record purchase"
        loading={record.isPending}
        onPress={submit}
      />
    </>
  );
}

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
          <PurchaseForm data={materials.data} ingredientId={ingredientId} />
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
