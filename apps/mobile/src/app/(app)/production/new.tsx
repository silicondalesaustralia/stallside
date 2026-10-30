import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { ProductionResponse } from "@contracts/mobile/production";
import { useBusiness } from "@/business/useBusiness";
import { useProduction, useRecordBatch } from "@/data/useProduction";
import { useBatchForm } from "@/lib/useBatchForm";
import { colors, spacing } from "@/lib/theme";
import BatchFormFields from "@/components/BatchFormFields";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

function RecordBatchForm({
  data,
  standId,
  recipeId,
}: {
  data: ProductionResponse;
  standId: string;
  recipeId?: string;
}) {
  const form = useBatchForm(data, recipeId);
  const record = useRecordBatch();

  function submit() {
    const problem = form.problem();
    if (problem) {
      Alert.alert("Check the batch", problem);
      return;
    }
    record.mutate(form.body(standId), {
      onSuccess: (result) => {
        Alert.alert("Recorded", result.message);
        router.back();
      },
      onError: (error) => Alert.alert("Couldn't record", error.message),
    });
  }

  return (
    <>
      <BatchFormFields data={data} form={form} />
      <PrimaryButton
        label="Record batch"
        loading={record.isPending}
        onPress={submit}
      />
    </>
  );
}

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
