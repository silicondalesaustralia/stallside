import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import type { CollectionOrder } from "@contracts/mobile/collections";
import { colors } from "@/lib/theme";

type Props = {
  order: CollectionOrder;
  pending: boolean;
  onAdvance: (orderId: string) => void;
};

export default function CollectionStatusButton({ order, pending, onAdvance }: Props) {
  if (order.status === "COLLECTED") return <Text style={styles.done}>Collected</Text>;
  if (!order.status) return null;
  if (!order.fullyPaid) return <Text style={styles.blocked}>Balance due</Text>;

  const label = order.status === "ORDERED" ? "Mark ready" : "Mark collected";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={pending}
      onPress={() => onAdvance(order.id)}
      style={({ pressed }) => [styles.button, (pressed || pending) && styles.dimmed]}
    >
      {pending ? <ActivityIndicator color={colors.brandText} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.brand, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, minWidth: 120, alignItems: "center" },
  dimmed: { opacity: 0.6 },
  label: { color: colors.brandText, fontWeight: "700", fontSize: 14 },
  done: { color: colors.brand, fontWeight: "700" },
  blocked: { color: colors.danger, fontWeight: "700" },
});
