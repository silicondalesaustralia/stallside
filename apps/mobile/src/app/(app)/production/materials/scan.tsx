import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router } from "expo-router";
import type {
  InvoiceReviewLine,
  InvoiceScanResponse,
} from "@contracts/mobile/invoice-scan";
import { useSaveInvoice, useScannedInvoice } from "@/data/useInvoiceScan";
import { formatCents } from "@/lib/format";
import {
  basisLabel,
  includedTotalCents,
  lineProblem,
  toSaveBody,
} from "@/lib/invoice-review";
import { colors, spacing } from "@/lib/theme";
import InvoiceHeaderCard from "@/components/InvoiceHeaderCard";
import InvoiceLineCard from "@/components/InvoiceLineCard";
import InvoiceNotices from "@/components/InvoiceNotices";
import PrimaryButton from "@/components/PrimaryButton";

function Review({ scan }: { scan: InvoiceScanResponse }) {
  const [invoice, setInvoice] = useState(scan.invoice);
  const save = useSaveInvoice();
  const included = invoice.lines.filter((l) => l.include);
  const blocked =
    included.length === 0 ||
    included.some((l) => lineProblem(l, scan.materials));

  function patchLine(key: string, patch: Partial<InvoiceReviewLine>) {
    setInvoice((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    }));
  }

  function submit() {
    save.mutate(toSaveBody(invoice), {
      onSuccess: (result) => {
        Alert.alert("Recorded", result.message);
        router.back();
      },
      onError: (error) => Alert.alert("Couldn't save", error.message),
    });
  }

  return (
    <>
      <InvoiceHeaderCard invoice={invoice} onChange={setInvoice} />
      <InvoiceNotices invoice={invoice} currency={scan.currency} />
      {invoice.lines.map((line) => (
        <InvoiceLineCard
          key={`${line.key}-${invoice.costBasis}`}
          line={line}
          materials={scan.materials}
          costLabel={basisLabel(invoice)}
          onChange={(patch) => patchLine(line.key, patch)}
        />
      ))}
      <Text style={styles.total}>
        {formatCents(includedTotalCents(invoice.lines), scan.currency)} goes
        into material costs
      </Text>
      <PrimaryButton
        label={`Record ${included.length} purchase${included.length === 1 ? "" : "s"}`}
        loading={save.isPending}
        disabled={blocked}
        onPress={submit}
      />
    </>
  );
}

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
          <Review scan={scan.data} />
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
  total: { color: colors.muted, fontSize: 14, textAlign: "center" },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
