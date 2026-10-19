import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
};

export default function StatTile({ label, value, hint, warn }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, warn && styles.warn]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  value: { color: colors.text, fontSize: 22, fontWeight: "800" },
  warn: { color: colors.danger },
  hint: { color: colors.muted, fontSize: 12 },
});
