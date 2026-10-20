import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useToken } from "@/auth/useAuth";
import { useSupplier, useSupplierChange } from "@/data/useSuppliers";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import SupplierStatsCard from "@/components/SupplierStatsCard";
import PendingLotsCard from "@/components/PendingLotsCard";
import PayoutCard from "@/components/PayoutCard";
import SupplierProductsCard from "@/components/SupplierProductsCard";
import PrimaryButton from "@/components/PrimaryButton";
import ErrorMessage from "@/components/ErrorMessage";

export default function SupplierScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const token = useToken();
  const detail = useSupplier(memberId);
  const change = useSupplierChange(memberId);
  const data = detail.data;

  if (detail.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (!data) {
    return (
      <View style={styles.center}>
        <ErrorMessage error={detail.error} />
      </View>
    );
  }

  const pending = change.isPending ? change.variables : undefined;
  const approvingId = pending?.kind === "approve" ? pending.lotId : null;

  function approve(lotId: string) {
    change.mutate(
      { kind: "approve", lotId },
      { onError: (error) => Alert.alert("Couldn't approve", error.message) },
    );
  }

  async function recordPayout(amount: string, note: string) {
    try {
      await change.mutateAsync({ kind: "payout", amount, note });
      Alert.alert("Payment recorded");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert("Couldn't record payment", message);
      return false;
    }
  }

  function confirmRevoke() {
    Alert.alert(
      `Revoke ${data?.supplier.name}?`,
      "They can no longer add stock. Their products and sales history stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () =>
            change.mutate(
              { kind: "revoke" },
              { onError: (e) => Alert.alert("Couldn't revoke", e.message) },
            ),
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={detail.isRefetching}
          onRefresh={() => void detail.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <SupplierStatsCard detail={data} />
      <PendingLotsCard
        lots={data.pendingLots}
        approvingId={approvingId}
        onApprove={approve}
      />
      <PayoutCard
        currency={data.currency}
        saving={pending?.kind === "payout"}
        onSubmit={recordPayout}
      />
      <SupplierProductsCard products={data.products} />
      <PrimaryButton
        label="Prices & products on web"
        onPress={() =>
          void openOnWeb(`/dashboard/suppliers/${data.supplier.id}`, token)
        }
      />
      {data.supplier.status !== "REVOKED" ? (
        <Pressable
          accessibilityRole="button"
          disabled={change.isPending}
          onPress={confirmRevoke}
          style={styles.revoke}
        >
          <Text style={styles.revokeLabel}>Revoke access</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  revoke: { alignItems: "center", paddingVertical: spacing.sm + 4 },
  revokeLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
