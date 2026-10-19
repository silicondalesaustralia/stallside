import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { EMPTY_UPSELL_INPUT } from "@contracts/mobile/upsells";
import { useBusiness } from "@/business/useBusiness";
import { useUpsell, useUpsellOptions } from "@/data/useUpsells";
import { colors, spacing } from "@/lib/theme";
import UpsellForm from "@/components/UpsellForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function UpsellScreen() {
  const params = useLocalSearchParams<{ upsellId: string }>();
  const upsellId = params.upsellId === "new" ? null : params.upsellId;
  const { selected } = useBusiness();
  const upsell = useUpsell(upsellId);
  const standId = upsell.data?.standId ?? selected?.id ?? null;
  const options = useUpsellOptions(upsellId && !upsell.data ? null : standId);
  const loading = (upsellId && upsell.isPending) || options.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{ title: upsellId ? "Edit upsell" : "New upsell" }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage error={upsell.error ?? options.error} />
        {loading ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : options.data && (!upsellId || upsell.data) ? (
          <UpsellForm
            key={upsell.data?.id ?? "new"}
            upsellId={upsellId}
            standId={standId}
            initial={upsell.data?.input ?? EMPTY_UPSELL_INPUT}
            options={options.data}
          />
        ) : null}
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
