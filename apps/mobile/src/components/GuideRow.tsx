import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileGuideSummary } from "@contracts/mobile/guides";
import { colors, spacing } from "@/lib/theme";

type Props = {
  guide: MobileGuideSummary;
  onPress: (slug: string) => void;
};

export default function GuideRow({ guide, onPress }: Props) {
  const tag = guide.comingSoon
    ? "Coming soon"
    : guide.hasVideo
      ? "Has video"
      : null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(guide.slug)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {guide.summary}
        </Text>
      </View>
      {tag ? <Text style={styles.tag}>{tag}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  summary: { color: colors.muted, fontSize: 13 },
  tag: { color: colors.muted, fontSize: 12, fontWeight: "600" },
});
