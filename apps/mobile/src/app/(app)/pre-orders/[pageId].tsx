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
import { router, useLocalSearchParams } from "expo-router";
import { useDeletePreOrderPage, usePreOrderPage } from "@/data/usePreOrders";
import { colors, spacing } from "@/lib/theme";
import PreOrderPageCard from "@/components/PreOrderPageCard";
import PreOrderPaymentCard from "@/components/PreOrderPaymentCard";
import PreOrderQrCard from "@/components/PreOrderQrCard";
import PreOrderItemsCard from "@/components/PreOrderItemsCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function PreOrderPageScreen() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const detail = usePreOrderPage(pageId);
  const remove = useDeletePreOrderPage();
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
    Alert.alert(
      `Delete “${data.page.title}”?`,
      "The link stops working. Products on no other pre-order page go back to normal products. Existing orders are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            remove.mutate(data.page.id, {
              onSuccess: () => router.back(),
              onError: (error) =>
                Alert.alert("Couldn't delete pre-order page", error.message),
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
      <PreOrderPageCard detail={data} />
      <PreOrderPaymentCard
        key={`${data.paymentOptions.join()}:${data.depositPercent}`}
        detail={data}
      />
      <PreOrderItemsCard detail={data} />
      <PreOrderQrCard detail={data} />
      <Pressable
        accessibilityRole="button"
        disabled={remove.isPending}
        onPress={confirmDelete}
        style={styles.delete}
      >
        <Text style={styles.deleteLabel}>Delete pre-order page</Text>
      </Pressable>
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
  delete: { alignItems: "center", paddingVertical: spacing.sm + 4 },
  deleteLabel: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
