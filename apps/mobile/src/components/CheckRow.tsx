import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  label: string;
  detail?: string | null;
  checked: boolean;
  onToggle: () => void;
};

export default function CheckRow({ label, detail, checked, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{label}</Text>
        {detail ? <Text style={styles.meta}>{detail}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  tick: { color: colors.brandText, fontSize: 14, fontWeight: "700" },
  body: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12 },
});
