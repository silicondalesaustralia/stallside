import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  currency: string;
  saving: boolean;
  /** Resolves true when the payment was recorded, so the form can clear. */
  onSubmit: (amount: string, note: string) => Promise<boolean>;
};

/** Records money paid to the supplier outside Vendl. */
export default function PayoutCard({ currency, saving, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    if (await onSubmit(amount.trim(), note.trim())) {
      setAmount("");
      setNote("");
    }
  }

  return (
    <Card title="Record a payment">
      <Text style={styles.hint}>
        For money you paid them yourself, e.g. cash or bank transfer.
      </Text>
      <View style={styles.row}>
        <FormField
          label={`Amount (${currency})`}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="50.00"
        />
        <FormField
          label="Note"
          value={note}
          onChangeText={setNote}
          placeholder="Optional"
        />
      </View>
      <PrimaryButton
        label="Record payment"
        loading={saving}
        disabled={!amount.trim()}
        onPress={() => void submit()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: "row", gap: spacing.sm },
});
