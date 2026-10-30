import { StyleSheet, Text } from "react-native";
import type { InvoiceReview } from "@contracts/mobile/invoice-scan";
import { switchBasis } from "@/lib/invoice-review";
import { openLink } from "@/lib/open-link";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import SwitchRow from "@/components/SwitchRow";

type Props = {
  invoice: InvoiceReview;
  onChange: (invoice: InvoiceReview) => void;
};

/** Supplier, invoice number, date and the tax basis for every line. */
export default function InvoiceHeaderCard({ invoice, onChange }: Props) {
  return (
    <Card title="Invoice">
      <FormField
        label="Supplier"
        value={invoice.supplier}
        onChangeText={(supplier) => onChange({ ...invoice, supplier })}
      />
      <FormField
        label="Invoice / receipt no."
        value={invoice.invoiceNumber}
        onChangeText={(invoiceNumber) =>
          onChange({ ...invoice, invoiceNumber })
        }
      />
      <FormField
        label="Received"
        value={invoice.invoiceDate}
        onChangeText={(invoiceDate) => onChange({ ...invoice, invoiceDate })}
        placeholder="YYYY-MM-DD"
      />
      {invoice.taxRecoverable ? (
        <SwitchRow
          label={`Record costs excluding ${invoice.taxLabel}`}
          hint={`Turn on if you're registered for ${invoice.taxLabel} and claim it back.`}
          value={invoice.costBasis === "ex-tax"}
          onChange={(on) =>
            onChange(switchBasis(invoice, on ? "ex-tax" : "inc-tax"))
          }
        />
      ) : null}
      {invoice.receiptUrl ? (
        <Text
          style={styles.link}
          onPress={() => void openLink(invoice.receiptUrl ?? "")}
        >
          View document
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.brand, fontSize: 14, fontWeight: "600" },
});
