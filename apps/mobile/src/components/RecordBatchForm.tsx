import { Alert } from "react-native";
import { router } from "expo-router";
import type { ProductionResponse } from "@contracts/mobile/production";
import { useRecordBatch } from "@/data/useProduction";
import { useBatchForm } from "@/lib/useBatchForm";
import BatchFormFields from "@/components/BatchFormFields";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  data: ProductionResponse;
  standId: string;
  recipeId?: string;
};

export default function RecordBatchForm({ data, standId, recipeId }: Props) {
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
