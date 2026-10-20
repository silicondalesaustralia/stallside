import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type {
  PaymentChoices,
  PaymentsResponse,
} from "@contracts/mobile/payments";
import { useSavePayments } from "@/data/usePayments";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PrimaryButton from "@/components/PrimaryButton";
import SwitchRow from "@/components/SwitchRow";

type Props = { standId: string; data: PaymentsResponse };

function squareHint(data: PaymentsResponse): string {
  if (!data.squareReady) {
    return "Connect Square, turn on payments and pick a location first.";
  }
  return data.squareIsProvider
    ? "Square card checkout. Money to your Square account."
    : "Shown once Square is your checkout provider (set on the web).";
}

/** What customers can pay with at this business's checkout. */
export default function PaymentsForm({ standId, data }: Props) {
  const [choices, setChoices] = useState(data.choices);
  const save = useSavePayments(standId);
  const set = (patch: Partial<PaymentChoices>) =>
    setChoices((current) => ({ ...current, ...patch }));

  function submit() {
    save.mutate(choices, {
      onSuccess: (saved) => {
        setChoices(saved.choices);
        Alert.alert("Saved", "Checkout payments updated.");
      },
      onError: (error) => Alert.alert("Couldn't save", error.message),
    });
  }

  return (
    <View style={styles.wrap}>
      <Card title="At checkout">
        <Text style={styles.hint}>Currency: {data.currency}.</Text>
        <SwitchRow
          label="Cash"
          hint="Customer confirms they paid cash at the stand."
          value={choices.acceptCash}
          onChange={(acceptCash) => set({ acceptCash })}
        />
        {data.localTransfer ? (
          <>
            <SwitchRow
              label="PayID"
              hint="Customer pays your PayID, then confirms."
              value={choices.acceptLocalTransfer}
              onChange={(acceptLocalTransfer) => set({ acceptLocalTransfer })}
            />
            <FormField
              label={data.localTransfer.label}
              value={choices.localTransferAlias}
              onChangeText={(localTransferAlias) => set({ localTransferAlias })}
              placeholder={data.localTransfer.placeholder}
              hint={data.localTransfer.hint}
              autoCapitalize="none"
            />
          </>
        ) : null}
        <SwitchRow
          label="Card / Tap & Go"
          hint={
            data.cardReady
              ? "Card, Apple Pay, Google Pay and more. Money to your Stripe."
              : "Finish Stripe setup before turning this on."
          }
          value={choices.acceptCard && data.cardReady}
          disabled={!data.cardReady}
          onChange={(acceptCard) => set({ acceptCard })}
        />
        {data.square ? (
          <SwitchRow
            label="Square"
            hint={squareHint(data)}
            value={choices.acceptSquare && data.squareReady}
            disabled={!data.squareReady}
            onChange={(acceptSquare) => set({ acceptSquare })}
          />
        ) : null}
      </Card>
      <PrimaryButton label="Save" loading={save.isPending} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hint: { color: colors.muted, fontSize: 13 },
});
