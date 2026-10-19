import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDeleteOffer, useSubscriptionOffer } from "@/data/useSubscriptions";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import SubscriptionOfferCard from "@/components/SubscriptionOfferCard";
import SubscriberRow from "@/components/SubscriberRow";
import ErrorMessage from "@/components/ErrorMessage";

export default function SubscriptionOfferScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const detail = useSubscriptionOffer(offerId);
  const remove = useDeleteOffer();
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

  function confirmDelete() {
    if (!data) return;
    Alert.alert(`Delete “${data.offer.title}”?`, "This permanently removes the offer. Active subscribers must cancel first.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          remove.mutate(data.offer.id, {
            onSuccess: () => router.back(),
            onError: (error) => Alert.alert("Couldn't delete subscription", error.message),
          }),
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={detail.isRefetching} onRefresh={() => void detail.refetch()} tintColor={colors.brand} />
      }
    >
      <SubscriptionOfferCard offer={data.offer} />
      <Card title={`Subscribers (${data.subscribers.length})`}>
        {data.subscribers.length ? (
          data.subscribers.map((subscriber) => <SubscriberRow key={subscriber.id} subscriber={subscriber} />)
        ) : (
          <Text style={styles.empty}>No one has signed up yet. Share the link to get started.</Text>
        )}
      </Card>
      <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={confirmDelete} style={styles.delete}>
        <Text style={styles.deleteLabel}>Delete subscription</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg * 2 },
  empty: { color: colors.muted, fontSize: 14 },
  delete: { alignItems: "center", paddingVertical: spacing.sm + 4 },
  deleteLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
