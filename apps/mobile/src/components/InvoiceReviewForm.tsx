import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import type {
  InvoiceReviewLine,
  InvoiceScanResponse,
} from "@contracts/mobile/invoice-scan";
import { useSaveInvoice } from "@/data/useInvoiceScan";
import { formatCents } from "@/lib/format";
import {
  basisLabel,
  includedTotalCents,
  lineProblem,
  toSaveBody,
} from "@/lib/invoice-review";
import { colors } from "@/lib/theme";
import InvoiceHeaderCard from "@/components/InvoiceHeaderCard";
import InvoiceLineCard from "@/components/InvoiceLineCard";
import InvoiceNotices from "@/components/InvoiceNotices";
import PrimaryButton from "@/components/PrimaryButton";

export default function InvoiceReviewForm({
  scan,
}: {
  scan: InvoiceScanResponse;
}) {
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

const styles = StyleSheet.create({
  total: { color: colors.muted, fontSize: 14, textAlign: "center" },
});
