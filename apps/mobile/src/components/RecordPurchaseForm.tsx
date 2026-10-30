import { Alert } from "react-native";
import { router } from "expo-router";
import type { MaterialsResponse } from "@contracts/mobile/materials";
import { useRecordPurchase } from "@/data/useMaterials";
import { usePurchaseForm } from "@/lib/usePurchaseForm";
import PrimaryButton from "@/components/PrimaryButton";
import PurchaseFormFields from "@/components/PurchaseFormFields";

type Props = { data: MaterialsResponse; ingredientId?: string };

export default function RecordPurchaseForm({ data, ingredientId }: Props) {
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
