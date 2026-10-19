import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
};

export default function SwitchRow({ label, value, onChange, hint }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: colors.brand }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  text: { flex: 1, gap: 2 },
  label: { color: colors.text, fontSize: 15 },
  hint: { color: colors.muted, fontSize: 12 },
});
