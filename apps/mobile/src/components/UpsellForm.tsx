import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type {
  UpsellFormOptions,
  UpsellInputValues,
} from "@contracts/mobile/upsells";
import { useDeleteUpsell, useSaveUpsell } from "@/data/useUpsells";
import type { SetUpsellField } from "@/lib/upsell-form";
import { colors, spacing } from "@/lib/theme";
import UpsellOfferCard from "@/components/UpsellOfferCard";
import UpsellScopeCard from "@/components/UpsellScopeCard";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  upsellId: string | null;
  standId: string | null;
  initial: UpsellInputValues;
  options: UpsellFormOptions;
};

/** Create or edit an upsell; the server validates it exactly like the web form. */
export default function UpsellForm({
  upsellId,
  standId,
  initial,
  options,
}: Props) {
  const [values, setValues] = useState(initial);
  const save = useSaveUpsell(upsellId, standId);
  const remove = useDeleteUpsell();
  const set: SetUpsellField = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));

  function submit() {
    save.mutate(values, {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert("Couldn't save upsell", error.message),
    });
  }

  function confirmDelete() {
    if (!upsellId) return;
    Alert.alert(
      `Delete “${values.name}”?`,
      "Shoppers won't see this offer any more.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            remove.mutate(upsellId, {
              onSuccess: () => router.back(),
              onError: (error) =>
                Alert.alert("Couldn't delete upsell", error.message),
            }),
        },
      ],
    );
  }

  return (
    <View style={styles.wrap}>
      <UpsellOfferCard values={values} set={set} options={options} />
      <UpsellScopeCard values={values} set={set} options={options} />
      <PrimaryButton
        label={upsellId ? "Save changes" : "Create upsell"}
        loading={save.isPending}
        disabled={
          remove.isPending || !values.name.trim() || !values.offerProductId
        }
        onPress={submit}
      />
      {upsellId ? (
        <Pressable
          accessibilityRole="button"
          disabled={remove.isPending}
          onPress={confirmDelete}
          style={styles.delete}
        >
          <Text style={styles.deleteLabel}>Delete upsell</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  delete: { alignItems: "center", paddingVertical: spacing.sm + 4 },
  deleteLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
