import { Alert, StyleSheet, Text } from "react-native";
import { useMarkOrderPaid } from "@/data/useOrderPayment";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

export default function MarkPaidCard({
  orderId,
  payAtPickup,
}: {
  orderId: string;
  payAtPickup: boolean;
}) {
  const markPaid = useMarkOrderPaid(orderId);

  function confirm() {
    Alert.alert(
      "Mark this order as paid?",
      "Only do this once the money has arrived.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark paid",
          onPress: () =>
            markPaid.mutate(undefined, {
              onError: (error) =>
                Alert.alert("Couldn't update the order", error.message),
            }),
        },
      ],
    );
  }

  return (
    <Card title="Payment">
      <Text style={styles.note}>
        {payAtPickup
          ? "This pre-order is paid at pickup. Mark it paid once you've taken the money."
          : "The shopper said they paid. Check your tin or bank, then mark it paid."}
      </Text>
      <PrimaryButton
        label="Mark paid"
        loading={markPaid.isPending}
        onPress={confirm}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: 14 },
});
