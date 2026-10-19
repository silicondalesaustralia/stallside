import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCustomer } from "@/data/useCustomers";
import { formatCents } from "@/lib/format";
import { mailtoUrl, openLink } from "@/lib/open-link";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import CustomerNotesCard from "@/components/CustomerNotesCard";
import CustomerOrdersCard from "@/components/CustomerOrdersCard";
import ErrorMessage from "@/components/ErrorMessage";
import StatTile from "@/components/StatTile";

export default function CustomerDetailScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const customer = useCustomer(customerId);
  const detail = customer.data;
  const title = detail?.name || detail?.email || "Customer";

  if (customer.isPending || !detail) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: "Customer" }} />
        {customer.isPending ? <ActivityIndicator color={colors.brand} /> : <ErrorMessage error={customer.error} />}
      </View>
    );
  }

  const { insight } = detail;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />
      <Card>
        <Text style={styles.name}>{title}</Text>
        {detail.email ? (
          <Pressable accessibilityRole="link" onPress={() => void openLink(mailtoUrl(detail.email ?? ""))}>
            <Text style={styles.link}>{detail.email}</Text>
          </Pressable>
        ) : null}
        {detail.phone ? (
          <Pressable accessibilityRole="link" onPress={() => void openLink(`tel:${detail.phone}`)}>
            <Text style={styles.link}>{detail.phone}</Text>
          </Pressable>
        ) : null}
        <Text style={styles.meta}>
          {detail.marketingConsent ? "Marketing ok" : "No marketing opt-in"}
          {detail.source ? ` · via ${detail.source}` : ""}
        </Text>
      </Card>
      <View style={styles.grid}>
        <StatTile label="Orders" value={String(insight.orderCount)} />
        <StatTile label="Spent" value={formatCents(insight.spendCents, detail.currency)} />
        <StatTile label="Average order" value={formatCents(insight.aovCents, detail.currency)} />
        <StatTile
          label="Last order"
          value={insight.lastOrderAt ? new Date(insight.lastOrderAt).toLocaleDateString() : "—"}
        />
      </View>
      {insight.productNames.length > 0 ? (
        <Text style={styles.meta}>Bought: {insight.productNames.join(", ")}</Text>
      ) : null}
      <CustomerNotesCard key={detail.notes ?? ""} customerId={detail.id} notes={detail.notes} />
      <CustomerOrdersCard orders={detail.orders} />
      {detail.subscriptions.length > 0 ? (
        <Card title="Subscriptions">
          {detail.subscriptions.map((sub) => (
            <Text key={sub.id} style={styles.meta}>
              {sub.title} · {sub.status.toLowerCase()}
              {sub.billingPlan ? ` · ${sub.billingPlan.toLowerCase()}` : ""}
            </Text>
          ))}
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  name: { color: colors.text, fontSize: 22, fontWeight: "800" },
  link: { color: colors.brand, fontSize: 15, textDecorationLine: "underline" },
  meta: { color: colors.muted, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
