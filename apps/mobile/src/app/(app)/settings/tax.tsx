import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useTaxSettings } from "@/data/useTaxSettings";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ErrorMessage from "@/components/ErrorMessage";
import TaxFreeProductsCard from "@/components/TaxFreeProductsCard";
import TaxPastOrdersCard from "@/components/TaxPastOrdersCard";
import TaxSettingsForm from "@/components/TaxSettingsForm";

export default function TaxSettingsScreen() {
  const tax = useTaxSettings();
  const data = tax.data;
  const region = data?.regions.find((r) => r.country === data.country);
  const name = region?.name ?? "Tax";
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={tax.isRefetching}
          onRefresh={() => void tax.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <Text style={styles.muted}>
        GST, VAT or sales tax for all your businesses. Orders, receipts,
        exports, profit and invoice scanning use this.
      </Text>
      <ErrorMessage error={tax.error} />
      {tax.isPending ? <ActivityIndicator color={colors.brand} /> : null}
      {data ? (
        <>
          <TaxSettingsForm key={data.status + data.country} data={data} />
          <TaxFreeProductsCard
            taxName={name}
            products={data.taxFreeProducts}
            total={data.taxFreeTotal}
          />
          <Card title="Subscriptions and memberships">
            <Text style={styles.muted}>
              {region?.inclusive
                ? `Subscription and membership prices include ${name}. Vendl records the ${name} inside each renewal.`
                : `Renewals charge the price you set, so include ${name.toLowerCase()} in subscription and membership prices. Vendl does not add it on top of recurring charges.`}
            </Text>
          </Card>
          {region?.inclusive ? <TaxPastOrdersCard taxName={name} /> : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  muted: { color: colors.muted, fontSize: 14 },
});
