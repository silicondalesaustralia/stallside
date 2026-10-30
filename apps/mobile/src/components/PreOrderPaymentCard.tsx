import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import {
  PRE_ORDER_PAY_OPTIONS,
  type PreOrderDetailResponse,
  type PreOrderPayOption,
} from "@contracts/mobile/preorders";
import { useSetPreOrderPayment } from "@/data/usePreOrders";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";
import SwitchRow from "@/components/SwitchRow";

const LABELS: Record<PreOrderPayOption, string> = {
  PAY_UPFRONT: "Pay in full now",
  DEPOSIT_THEN_BALANCE: "Pay a deposit now",
  PAY_AT_PICKUP: "Pay at pickup",
};

/** Ways shoppers can pay on this page; the first one switched on is the checkout default. */
export default function PreOrderPaymentCard({
  detail,
}: {
  detail: PreOrderDetailResponse;
}) {
  const [options, setOptions] = useState<PreOrderPayOption[]>(
    detail.paymentOptions,
  );
  const [deposit, setDeposit] = useState(String(detail.depositPercent ?? 30));
  const save = useSetPreOrderPayment(detail.page.id);
  const delivers = detail.handoverMode === "DELIVER";

  const depositOn = options.includes("DEPOSIT_THEN_BALANCE");
  const percent = Number.parseInt(deposit, 10);
  const dirty =
    options.join() !== detail.paymentOptions.join() ||
    (depositOn && percent !== (detail.depositPercent ?? 30));

  function toggle(option: PreOrderPayOption, on: boolean) {
    const next = on
      ? [...options, option]
      : options.filter((o) => o !== option);
    setOptions(PRE_ORDER_PAY_OPTIONS.filter((o) => next.includes(o)));
  }

  function hint(option: PreOrderPayOption): string | undefined {
    if (option === "PAY_AT_PICKUP" && delivers)
      return "Only for pages where customers collect.";
    if (option === "DEPOSIT_THEN_BALANCE")
      return "The balance is charged to the same card after the collection time.";
    if (option === "PAY_AT_PICKUP")
      return "Not paid online, so a no-show costs you the stock.";
    return undefined;
  }

  return (
    <Card title="Payment">
      {PRE_ORDER_PAY_OPTIONS.map((option) => (
        <SwitchRow
          key={option}
          label={LABELS[option]}
          hint={hint(option)}
          value={options.includes(option)}
          disabled={
            option === "PAY_AT_PICKUP" && delivers && !options.includes(option)
          }
          onChange={(on) => toggle(option, on)}
        />
      ))}
      {depositOn ? (
        <View style={styles.deposit}>
          <Text style={styles.label}>Deposit</Text>
          <TextInput
            accessibilityLabel="Deposit percent"
            style={styles.input}
            keyboardType="number-pad"
            value={deposit}
            onChangeText={(text) =>
              setDeposit(text.replace(/\D/g, "").slice(0, 2))
            }
            selectTextOnFocus
          />
          <Text style={styles.label}>%</Text>
        </View>
      ) : null}
      {!detail.cardReady ? (
        <Text style={styles.warn}>
          Stripe or Square isn&apos;t connected, so only Pay at pickup works at
          checkout.
        </Text>
      ) : null}
      {dirty ? (
        <PrimaryButton
          label="Save payment options"
          loading={save.isPending}
          disabled={options.length === 0}
          onPress={() =>
            save.mutate(
              {
                paymentOptions: options,
                depositPercent: depositOn ? percent || null : null,
              },
              {
                onError: (error) =>
                  Alert.alert("Couldn't save payment options", error.message),
              },
            )
          }
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  deposit: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { color: colors.text, fontSize: 15 },
  input: {
    minWidth: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  warn: { color: colors.danger, fontSize: 13 },
});
