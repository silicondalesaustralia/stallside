import { StyleSheet, Text, View } from "react-native";
import type { SupplierDetailResponse } from "@contracts/mobile/suppliers";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  lots: SupplierDetailResponse["pendingLots"];
  approvingId: string | null;
  onApprove: (lotId: string) => void;
};

/** Stock the supplier added that isn't sellable until the owner approves it. */
export default function PendingLotsCard({
  lots,
  approvingId,
  onApprove,
}: Props) {
  if (lots.length === 0) return null;
  return (
    <Card title="Waiting for approval">
      <Text style={styles.hint}>Approving adds these units to your stock.</Text>
      {lots.map((lot) => (
        <View key={lot.id} style={styles.row}>
          <Text style={styles.label}>{lot.label}</Text>
          <PrimaryButton
            label="Approve"
            loading={approvingId === lot.id}
            disabled={approvingId !== null}
            onPress={() => onApprove(lot.id)}
          />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  label: { flex: 1, color: colors.text, fontSize: 15 },
});
