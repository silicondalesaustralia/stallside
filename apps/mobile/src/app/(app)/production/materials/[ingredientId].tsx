import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { MobilePurchase } from "@contracts/mobile/materials";
import { useBusiness } from "@/business/useBusiness";
import { useToken } from "@/auth/useAuth";
import { useMaterial, useRemovePurchase } from "@/data/useMaterials";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ErrorMessage from "@/components/ErrorMessage";
import MaterialSummaryCard from "@/components/MaterialSummaryCard";
import PrimaryButton from "@/components/PrimaryButton";
import PurchaseRow from "@/components/PurchaseRow";

export default function MaterialScreen() {
  const { ingredientId } = useLocalSearchParams<{ ingredientId: string }>();
  const { selected } = useBusiness();
  const token = useToken();
  const detail = useMaterial(selected?.id ?? null, ingredientId);
  const remove = useRemovePurchase();
  const data = detail.data;
  const removingId = remove.isPending ? remove.variables : undefined;

  function confirmRemove(purchase: MobilePurchase) {
    Alert.alert(
      "Remove this purchase?",
      `${purchase.quantityLabel} comes back out of stock.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            remove.mutate(purchase.id, {
              onError: (error) => Alert.alert("Couldn't remove", error.message),
            }),
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
      <ErrorMessage error={detail.error} />
      {detail.isPending ? <ActivityIndicator color={colors.brand} /> : null}
      {data ? (
        <>
          <MaterialSummaryCard material={data.material} usedIn={data.usedIn} />
          {data.material.status !== "archived" ? (
            <PrimaryButton
              label="Record incoming supplies"
              onPress={() =>
                router.push({
                  pathname: "/production/materials/purchase",
                  params: { ingredientId },
                })
              }
            />
          ) : null}
          <Card title="Purchase history">
            {data.purchases.length === 0 ? (
              <Text style={styles.muted}>No purchases recorded yet.</Text>
            ) : (
              data.purchases.map((p) => (
                <PurchaseRow
                  key={p.id}
                  purchase={p}
                  currency={data.currency}
                  removing={removingId === p.id}
                  onRemove={confirmRemove}
                />
              ))
            )}
          </Card>
          <Text
            style={styles.link}
            onPress={() =>
              void openOnWeb(
                `/dashboard/production/materials/${ingredientId}`,
                token,
              )
            }
          >
            Edit details on the web
          </Text>
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
  link: { color: colors.brand, fontSize: 14, fontWeight: "600" },
});
