import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { CommunicationInput } from "@contracts/mobile/communication";
import { useComposeOptions } from "@/data/useCommunication";
import { colors, spacing } from "@/lib/theme";
import ComposeForm from "@/components/ComposeForm";
import ErrorMessage from "@/components/ErrorMessage";

export default function NewMessageScreen() {
  const { listId, customerId } = useLocalSearchParams<{
    listId?: string;
    customerId?: string;
  }>();
  const options = useComposeOptions();
  const initial: CommunicationInput = {
    audienceType: listId ? "list" : customerId ? "customer" : "all_marketing",
    customerId: customerId ?? null,
    listId: listId ?? null,
    preOrderPageId: null,
    productIds: [],
    recipientEmails: [],
    subject: "",
    heading: "",
    body: "",
    ctaLabel: "",
    ctaUrl: "",
  };

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
        <ErrorMessage error={options.error} />
        {options.isPending ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : null}
        {options.data ? (
          <ComposeForm options={options.data} initial={initial} />
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
