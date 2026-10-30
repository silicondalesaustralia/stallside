import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useCheckPayPalRefund } from "@/data/useOrderPayment";
import { formatCents } from "@/lib/format";
import { openLink } from "@/lib/open-link";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

type Props = {
  orderId: string;
  refundUrl: string;
  refundedCents: number;
  totalCents: number;
  currency: string;
};

export default function PayPalRefundCard({
  orderId,
  refundUrl,
  refundedCents,
  totalCents,
  currency,
}: Props) {
  const check = useCheckPayPalRefund(orderId);
  const partial = refundedCents > 0 && refundedCents < totalCents;

  return (
    <Card title="Refund">
      {partial ? (
        <Text style={styles.badge}>
          Partially refunded {formatCents(refundedCents, currency)}
        </Text>
      ) : null}
      <Text style={styles.note}>
        PayPal refunds are made in your PayPal account. Afterwards, check the
        status here to update the order.
      </Text>
      <PrimaryButton
        label="Refund in PayPal"
        onPress={() => void openLink(refundUrl)}
      />
      <Pressable
        accessibilityRole="button"
        disabled={check.isPending}
        onPress={() =>
          check.mutate(undefined, {
            onSuccess: (result) => Alert.alert("Refund status", result.message),
            onError: (error) =>
              Alert.alert("Couldn't check PayPal", error.message),
          })
        }
        style={({ pressed }) => [
          styles.link,
          (pressed || check.isPending) && styles.dimmed,
        ]}
      >
        <Text style={styles.linkText}>
          {check.isPending ? "Checking…" : "Check refund status"}
        </Text>
      </Pressable>
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
  link: { alignItems: "center", paddingVertical: spacing.sm },
  linkText: { color: colors.brand, fontWeight: "600", fontSize: 15 },
  dimmed: { opacity: 0.6 },
});
