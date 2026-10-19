import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useToken } from "@/auth/useAuth";
import { useBusiness } from "@/business/useBusiness";
import { useSetOfferActive, useSubscriptionOffers } from "@/data/useSubscriptions";
import { openSubscription } from "@/lib/navigation";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import SubscriptionOfferRow from "@/components/SubscriptionOfferRow";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function SubscriptionsScreen() {
  const token = useToken();
  const { selected } = useBusiness();
  const offers = useSubscriptionOffers(selected?.id ?? null);
  const setActive = useSetOfferActive();

  function toggle(id: string, isActive: boolean) {
    setActive.mutate(
      { id, isActive },
      { onError: (error) => Alert.alert("Couldn't update subscription", error.message) },
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={offers.data?.offers ?? []}
      keyExtractor={(offer) => offer.id}
      renderItem={({ item }) => <SubscriptionOfferRow offer={item} onPress={openSubscription} onToggle={toggle} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton
            label="New subscription"
            onPress={() => void openOnWeb("/dashboard/subscriptions/new", token)}
          />
          <Text style={styles.hint}>Products, prices and Stripe set-up are done on the web.</Text>
          <ErrorMessage error={offers.error} />
        </View>
      }
      ListEmptyComponent={
        offers.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : (
          <Text style={styles.empty}>No subscriptions yet. Pick products, set how often, share the link.</Text>
        )
      }
      refreshControl={
        <RefreshControl refreshing={offers.isRefetching} onRefresh={() => void offers.refetch()} tintColor={colors.brand} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg * 2 },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
