import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

type Props = { label: string; accessibilityLabel: string; onPress: () => void };

/** Small circular button showing a single glyph, e.g. ‹ or ›. */
export default function RoundIconButton({
  label,
  accessibilityLabel,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  label: { color: colors.text, fontSize: 24, lineHeight: 26 },
});
