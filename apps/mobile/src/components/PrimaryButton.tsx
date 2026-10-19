import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, (pressed || inactive) && styles.dimmed]}
    >
      {loading ? <ActivityIndicator color={colors.brandText} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  dimmed: { opacity: 0.6 },
  label: { color: colors.brandText, fontSize: 16, fontWeight: "600" },
});
