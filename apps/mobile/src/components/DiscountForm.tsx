import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { DiscountInputValues } from "@contracts/mobile/discounts";
import { useDeleteDiscount, useSaveDiscount } from "@/data/useDiscounts";
import { webOnlySettings, type SetDiscountField } from "@/lib/discount-form";
import { colors, spacing } from "@/lib/theme";
import DiscountBasicsCard from "@/components/DiscountBasicsCard";
import DiscountRulesCard from "@/components/DiscountRulesCard";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  discountId: string | null;
  standId: string | null;
  initial: DiscountInputValues;
};

/** Create or edit a code; the server validates it exactly like the web form. */
export default function DiscountForm({ discountId, standId, initial }: Props) {
  const [values, setValues] = useState(initial);
  const save = useSaveDiscount(discountId, standId);
  const remove = useDeleteDiscount();
  const set: SetDiscountField = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const webOnly = webOnlySettings(values);

  function submit() {
    save.mutate(values, {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert("Couldn't save discount", error.message),
    });
  }

  function confirmDelete() {
    if (!discountId) return;
    Alert.alert(`Delete ${values.code}?`, "Customers won't be able to use this code any more.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          remove.mutate(discountId, {
            onSuccess: () => router.back(),
            onError: (error) => Alert.alert("Couldn't delete discount", error.message),
          }),
      },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <DiscountBasicsCard values={values} set={set} />
      <DiscountRulesCard values={values} set={set} />
      {webOnly ? <Text style={styles.hint}>{webOnly}</Text> : null}
      <PrimaryButton
        label={discountId ? "Save changes" : "Create code"}
        loading={save.isPending}
        disabled={remove.isPending || values.code.trim().length < 2}
        onPress={submit}
      />
      {discountId ? (
        <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={confirmDelete} style={styles.delete}>
          <Text style={styles.deleteLabel}>Delete code</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  delete: { alignItems: "center", paddingVertical: spacing.sm + 4 },
  deleteLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
