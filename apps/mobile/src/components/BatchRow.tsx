import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ProductionBatchDto } from "@contracts/mobile/production";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

type Props = {
  batch: ProductionBatchDto;
  currency: string;
  undoing: boolean;
  onUndo: (batch: ProductionBatchDto) => void;
};

function day(value: string): string {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/** One production run, like a row on the web Batches page. */
export default function BatchRow({ batch, currency, undoing, onUndo }: Props) {
  const made = `${batch.batchCount} × ${batch.recipeName}`;
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.code}>
          {batch.batchCode} · {day(batch.madeOn)}
        </Text>
        <Text style={styles.text}>
          {batch.productName ? `${made} → ${batch.productName}` : made}
        </Text>
        <Text style={styles.meta}>
          {batch.unitsMade} units ·{" "}
          {formatCents(batch.totalCostCents, currency)}
          {batch.unitCostCents != null
            ? ` (${formatCents(batch.unitCostCents, currency)} each)`
            : ""}
        </Text>
        {batch.bestBefore ? (
          <Text style={styles.meta}>Best before {day(batch.bestBefore)}</Text>
        ) : null}
        {batch.notes ? <Text style={styles.meta}>{batch.notes}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Undo batch ${batch.batchCode}`}
        disabled={undoing}
        onPress={() => onUndo(batch)}
        style={({ pressed }) => [
          styles.undo,
          (pressed || undoing) && styles.dim,
        ]}
      >
        <Text style={styles.undoText}>{undoing ? "Undoing…" : "Undo"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  body: { flex: 1, gap: 2 },
  code: { color: colors.text, fontSize: 15, fontWeight: "700" },
  text: { color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 13 },
  undo: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  dim: { opacity: 0.6 },
  undoText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
