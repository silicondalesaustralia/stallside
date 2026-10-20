import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useAccount } from "@/data/useAccount";
import { colors, spacing } from "@/lib/theme";
import BusinessNameCard from "@/components/BusinessNameCard";
import DeleteAccountCard from "@/components/DeleteAccountCard";
import Card from "@/components/Card";
import ErrorMessage from "@/components/ErrorMessage";

export default function AccountScreen() {
  const account = useAccount();
  const data = account.data;

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
        <ErrorMessage error={account.error} />
        {account.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : null}
        {data ? (
          <>
            <BusinessNameCard account={data} />
            <Card title="Vendl subscription">
              <Text style={styles.text}>{data.subscription}</Text>
              <Text style={styles.muted}>
                Billing region: {data.billingRegion}
              </Text>
            </Card>
            <DeleteAccountCard />
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
  text: { color: colors.text, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13 },
});
