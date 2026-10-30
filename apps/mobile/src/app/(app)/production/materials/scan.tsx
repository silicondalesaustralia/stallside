import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useScannedInvoice } from "@/data/useInvoiceScan";
import { colors, spacing } from "@/lib/theme";
import InvoiceReviewForm from "@/components/InvoiceReviewForm";

/** Check what the scan read before anything is saved. */
export default function InvoiceReviewScreen() {
  const scan = useScannedInvoice();
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
        {scan.data ? (
          <InvoiceReviewForm scan={scan.data} />
        ) : (
          <Text style={styles.empty}>
            Nothing to review. Scan an invoice from Materials.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
