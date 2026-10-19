import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
  warning?: boolean;
  onPress: () => void;
};

export default function QrRow({
  title,
  subtitle,
  badge,
  warning,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>
          {title}
          {badge ? <Text style={styles.badge}> {badge}</Text> : null}
        </Text>
        <Text style={[styles.subtitle, warning && styles.warning]}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  badge: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  subtitle: { color: colors.muted, fontSize: 13 },
  warning: { color: colors.danger },
  chevron: { color: colors.muted, fontSize: 24 },
});
