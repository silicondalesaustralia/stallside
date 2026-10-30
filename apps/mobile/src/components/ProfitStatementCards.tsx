import { StyleSheet, Text } from "react-native";
import type { ProfitResponse } from "@contracts/mobile/profit";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import MoneyLine from "@/components/MoneyLine";

/** The two statement cards from the web Profit & loss page. */
export default function ProfitStatementCards({ p }: { p: ProfitResponse }) {
  const c = p.currency;
  return (
    <>
      <Card title="Profit and loss">
        <MoneyLine
          label="Sales"
          cents={p.salesCents}
          currency={c}
          hint="What customers paid, including delivery and fees passed on"
        />
        {p.gstCents > 0 ? (
          <MoneyLine
            label={`Less ${p.taxLabel} collected`}
            cents={-p.gstCents}
            currency={c}
          />
        ) : null}
        <MoneyLine
          label="Less cost of goods sold"
          cents={-p.cogsCents}
          currency={c}
          hint="Units sold × unit cost"
        />
        <MoneyLine
          label="Less platform and card fees"
          cents={-p.feesCents}
          currency={c}
        />
        <MoneyLine
          label="Gross profit"
          cents={p.grossProfitCents}
          currency={c}
          strong
        />
        <Text style={styles.note}>
          Gross margin{" "}
          {p.grossMarginPercent == null
            ? "—"
            : `${p.grossMarginPercent.toFixed(1)}%`}
        </Text>
      </Card>
      <Card title="Production in this period">
        <MoneyLine
          label="Supplies purchased"
          cents={p.suppliesPurchasedCents}
          currency={c}
          hint="Cash spent on materials (all businesses)"
        />
        <MoneyLine
          label={`Cost of ${p.batchesMade} batch(es) made`}
          cents={p.productionCostCents}
          currency={c}
          hint="Materials, labour and overhead"
        />
        <Text style={styles.small}>
          Supplies are counted in cost of goods when the finished product sells,
          not when you buy them.
        </Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: 14 },
  small: { color: colors.muted, fontSize: 12 },
});
