import { StyleSheet, Text, View } from "react-native";
import type { InvoiceReview } from "@contracts/mobile/invoice-scan";
import { formatCents } from "@/lib/format";
import {
  basisLabel,
  includedTotalCents,
  invoiceTotalCents,
  totalsMismatch,
} from "@/lib/invoice-review";
import { colors, spacing } from "@/lib/theme";

type Props = { invoice: InvoiceReview; currency: string };

function intro(invoice: InvoiceReview): string {
  const tax = invoice.taxLabel;
  const basis =
    invoice.costBasis === "ex-tax"
      ? `Costs exclude ${tax} because you claim it back.`
      : invoice.taxRecoverable
        ? `Costs include any ${tax} paid.`
        : `Costs include any ${tax} paid, since it's part of what your supplies cost you.`;
  return `Check each line, then record. Included lines add to stock and become each material's current cost, so recipes and profit update straight away. ${basis}`;
}

/** Same notes as the web review: how costs work, duplicates, totals and currency. */
export default function InvoiceNotices({ invoice, currency }: Props) {
  const total = invoiceTotalCents(invoice);
  const otherCurrency =
    invoice.currency &&
    invoice.currency.toUpperCase() !== currency.toUpperCase();
  return (
    <View style={styles.list}>
      <Text style={styles.info}>{intro(invoice)}</Text>
      {invoice.duplicateOf ? (
        <Text style={[styles.warn, styles.bold]}>
          Invoice {invoice.invoiceNumber} looks like it was already recorded on{" "}
          {invoice.duplicateOf}. Recording it again will double the stock.
        </Text>
      ) : null}
      {totalsMismatch(invoice) && total != null ? (
        <Text style={styles.warn}>
          Included lines total{" "}
          {formatCents(includedTotalCents(invoice.lines), currency)}; the
          invoice says {formatCents(total, currency)} ({basisLabel(invoice)}).
          Delivery and fees are left out on purpose. Check nothing else is
          missing.
        </Text>
      ) : null}
      {otherCurrency ? (
        <Text style={styles.warn}>
          This invoice is in {invoice.currency}, but your business uses{" "}
          {currency}. Convert the costs before recording.
        </Text>
      ) : null}
    </View>
  );
}

const note = { borderRadius: 12, padding: spacing.sm + 4, fontSize: 13 };

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  info: { ...note, backgroundColor: colors.surface, color: colors.muted },
  warn: { ...note, backgroundColor: "#fffaeb", color: "#93370d" },
  bold: { fontWeight: "700" },
});
