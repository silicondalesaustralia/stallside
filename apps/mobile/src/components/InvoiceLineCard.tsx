import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import type { InvoiceReviewLine } from "@contracts/mobile/invoice-scan";
import {
  lineProblem,
  unitOptions,
  type ScanMaterial,
} from "@/lib/invoice-review";
import { centsToInput, inputToCents } from "@/lib/money-input";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import PickerField from "@/components/PickerField";
import UnitChips from "@/components/UnitChips";

type Props = {
  line: InvoiceReviewLine;
  materials: ScanMaterial[];
  costLabel: string;
  onChange: (patch: Partial<InvoiceReviewLine>) => void;
};

const NEW = { id: "new", label: "+ New material" };

/** One invoice line: include it, match it to a material, and fix quantity or cost. */
export default function InvoiceLineCard({
  line,
  materials,
  costLabel,
  onChange,
}: Props) {
  const [quantity, setQuantity] = useState(String(line.quantity));
  const [cost, setCost] = useState(centsToInput(line.totalCents));
  const problem = lineProblem(line, materials);
  const units = unitOptions(line, materials);
  return (
    <Card>
      <View style={styles.header}>
        <Text style={[styles.title, !line.include && styles.off]}>
          {line.description}
        </Text>
        <Switch
          accessibilityLabel={`Include ${line.description}`}
          value={line.include}
          onValueChange={(include) => onChange({ include })}
          trackColor={{ true: colors.brand }}
        />
      </View>
      {line.confidence === "low" ? (
        <Text style={styles.warn}>Hard to read — please check</Text>
      ) : null}
      {line.include ? (
        <>
          <PickerField
            label="Material"
            options={[
              NEW,
              ...materials.map((m) => ({ id: m.id, label: m.name })),
            ]}
            selected={line.materialId ? [line.materialId] : []}
            multiple={false}
            placeholder="Choose…"
            onChange={(ids) => ids[0] && onChange({ materialId: ids[0] })}
          />
          {line.materialId === "new" ? (
            <FormField
              label="New material name"
              value={line.description}
              onChangeText={(description) => onChange({ description })}
            />
          ) : null}
          <FormField
            label="Quantity received"
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              onChange({ quantity: Number(text) || 0 });
            }}
            keyboardType="decimal-pad"
          />
          <UnitChips
            units={units}
            value={line.unit}
            onChange={(unit) => onChange({ unit })}
          />
          <FormField
            label={`Cost (${costLabel})`}
            value={cost}
            onChangeText={(text) => {
              setCost(text);
              onChange({ totalCents: inputToCents(text) ?? 0 });
            }}
            keyboardType="decimal-pad"
          />
          {problem ? <Text style={styles.problem}>{problem}</Text> : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  title: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "700" },
  off: { color: colors.muted, textDecorationLine: "line-through" },
  warn: { color: "#b54708", fontSize: 12, fontWeight: "600" },
  problem: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
