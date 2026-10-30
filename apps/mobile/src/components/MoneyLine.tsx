import { StyleSheet, Text, View } from "react-native";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

type Props = {
  label: string;
  cents: number;
  currency: string;
  hint?: string;
  strong?: boolean;
};

/** One label/amount row in a statement; negative amounts show in red. */
export default function MoneyLine({
  label,
  cents,
  currency,
  hint,
  strong,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text
        style={[
          styles.amount,
          strong && styles.strong,
          cents < 0 && styles.negative,
        ]}
      >
        {formatCents(cents, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  text: { flex: 1, gap: 2 },
  label: { color: colors.text, fontSize: 14 },
  hint: { color: colors.muted, fontSize: 12 },
  amount: { color: colors.text, fontSize: 14, fontVariant: ["tabular-nums"] },
  strong: { fontSize: 16, fontWeight: "700" },
  negative: { color: colors.danger },
});
