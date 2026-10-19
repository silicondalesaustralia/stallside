import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import type { CustomerSummary } from "@contracts/mobile/customers";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

export default function CustomerRow({ customer }: { customer: CustomerSummary }) {
  const contact = [customer.name ? customer.email : null, customer.phone].filter(Boolean).join(" · ");
  const stats = [
    `${customer.orderCount} order${customer.orderCount === 1 ? "" : "s"}`,
    customer.spendCents > 0 ? `${formatCents(customer.spendCents, customer.currency)} spent` : null,
    customer.marketingConsent ? "marketing ok" : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/customers/[customerId]", params: { customerId: customer.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.name}>{customer.name || customer.email || "Customer"}</Text>
      {contact ? <Text style={styles.meta}>{contact}</Text> : null}
      <Text style={styles.meta}>{stats.join(" · ")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
});
