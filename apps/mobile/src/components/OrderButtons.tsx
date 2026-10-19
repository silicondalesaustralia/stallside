import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

type Props = {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  onMove: (direction: -1 | 1) => void;
};

/** Up/down arrows for reordering a list. */
export default function OrderButtons({
  label,
  isFirst,
  isLast,
  disabled,
  onMove,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Move ${label} up`}
        disabled={disabled || isFirst}
        onPress={() => onMove(-1)}
        hitSlop={6}
        style={[styles.button, (disabled || isFirst) && styles.off]}
      >
        <Text style={styles.arrow}>▲</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Move ${label} down`}
        disabled={disabled || isLast}
        onPress={() => onMove(1)}
        hitSlop={6}
        style={[styles.button, (disabled || isLast) && styles.off]}
      >
        <Text style={styles.arrow}>▼</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  button: {
    width: 32,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  off: { opacity: 0.3 },
  arrow: { color: colors.brand, fontSize: 11 },
});
