import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { EMPTY_DISCOUNT_INPUT } from "@contracts/mobile/discounts";
import { useBusiness } from "@/business/useBusiness";
import { useDiscount } from "@/data/useDiscounts";
import { colors, spacing } from "@/lib/theme";
import DiscountForm from "@/components/DiscountForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function DiscountScreen() {
  const params = useLocalSearchParams<{ discountId: string }>();
  const discountId = params.discountId === "new" ? null : params.discountId;
  const { selected } = useBusiness();
  const discount = useDiscount(discountId);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: discountId ? "Edit discount" : "New discount" }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ErrorMessage error={discount.error} />
        {discountId && discount.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : discountId && !discount.data ? null : (
          <DiscountForm
            key={discount.data?.id ?? "new"}
            discountId={discountId}
            standId={selected?.id ?? null}
            initial={discount.data?.input ?? EMPTY_DISCOUNT_INPUT}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.lg * 2 },
  loading: { marginTop: spacing.lg },
});
