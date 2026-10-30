import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput } from "react-native";
import { useRefundOrder } from "@/data/useOrderPayment";
import { formatCents } from "@/lib/format";
import { centsToInput, inputToCents } from "@/lib/money-input";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";
import SwitchRow from "@/components/SwitchRow";

type Props = {
  orderId: string;
  provider: "Stripe" | "Square";
  remainingCents: number;
  refundedCents: number;
  currency: string;
};

/** Same refund as the web order page: back to the customer's card, partial or full. */
export default function CardRefundCard({
  orderId,
  provider,
  remainingCents,
  refundedCents,
  currency,
}: Props) {
  const [amount, setAmount] = useState(centsToInput(remainingCents));
  const [restock, setRestock] = useState(true);
  const refund = useRefundOrder(orderId);

  const cents = inputToCents(amount);
  const valid = cents != null && cents > 0 && cents <= remainingCents;
  const isFull = cents === remainingCents;

  function confirm() {
    if (!valid || cents == null) return;
    const money = formatCents(cents, currency);
    Alert.alert(
      `Refund ${money}?`,
      `It goes back to the customer's card through ${provider}. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refund",
          style: "destructive",
          onPress: () =>
            refund.mutate(
              { amountCents: cents, restock: isFull && restock },
              {
                onSuccess: (result) =>
                  Alert.alert("Refund sent", result.message),
                onError: (error) => Alert.alert("Refund failed", error.message),
              },
            ),
        },
      ],
    );
  }

  return (
    <Card title="Refund">
      {refundedCents > 0 ? (
        <Text style={styles.badge}>
          Partially refunded {formatCents(refundedCents, currency)}
        </Text>
      ) : null}
      <Text style={styles.note}>
        {formatCents(remainingCents, currency)} left to refund
      </Text>
      <TextInput
        accessibilityLabel="Refund amount"
        style={styles.input}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        selectTextOnFocus
      />
      {isFull ? (
        <SwitchRow
          label="Return items to stock"
          value={restock}
          onChange={setRestock}
        />
      ) : null}
      <PrimaryButton
        label={
          valid && cents != null
            ? `Refund ${formatCents(cents, currency)}`
            : "Enter an amount to refund"
        }
        loading={refund.isPending}
        disabled={!valid}
        onPress={confirm}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  note: { color: colors.muted, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
