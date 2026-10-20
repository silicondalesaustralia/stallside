import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useBusiness } from "@/business/useBusiness";
import { usePayments } from "@/data/usePayments";
import { colors, spacing } from "@/lib/theme";
import PaymentProvidersCard from "@/components/PaymentProvidersCard";
import PaymentsForm from "@/components/PaymentsForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function PaymentsScreen() {
  const { selected } = useBusiness();
  const payments = usePayments(selected?.id ?? null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage error={payments.error} />
        {payments.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : null}
        {selected && payments.data ? (
          <>
            <PaymentProvidersCard data={payments.data} />
            <PaymentsForm
              key={selected.id}
              standId={selected.id}
              data={payments.data}
            />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  loading: { marginTop: spacing.lg },
});
