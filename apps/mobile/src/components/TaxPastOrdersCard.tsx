import { Alert, StyleSheet, Text } from "react-native";
import { useSyncPastOrderTax } from "@/data/useTaxSettings";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** Recalculates tax on orders already taken (tax-inclusive regions only). */
export default function TaxPastOrdersCard({ taxName }: { taxName: string }) {
  const sync = useSyncPastOrderTax();

  function confirm() {
    Alert.alert(
      `Sync ${taxName} on past orders?`,
      `Recalculates the ${taxName} recorded on orders you've already taken, using your current settings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sync",
          onPress: () =>
            sync.mutate(undefined, {
              onSuccess: (result) => Alert.alert("Synced", result.message),
              onError: (error) => Alert.alert("Sync failed", error.message),
            }),
        },
      ],
    );
  }

  return (
    <Card title="Past orders">
      <Text style={styles.muted}>
        Changed your registration or tax-free products? Recalculate the{" "}
        {taxName} on orders you have already taken.
      </Text>
      <PrimaryButton label="Sync" loading={sync.isPending} onPress={confirm} />
      <Text style={styles.hint}>
        New orders get tax automatically. Sync updates past orders after you
        change your registration or rate, or mark products tax-free.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 14 },
  hint: { color: colors.muted, fontSize: 12 },
});
