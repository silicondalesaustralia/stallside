import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { MobileFeature } from "@contracts/mobile/me";
import { featureIcon } from "@/lib/feature-icons";
import { colors, spacing } from "@/lib/theme";

type Props = {
  feature: MobileFeature;
  onPress: (feature: MobileFeature) => void;
};

export default function FeatureRow({ feature, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={feature.comingSoon}
      onPress={() => onPress(feature)}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
        feature.comingSoon && styles.soon,
      ]}
    >
      <View style={styles.left}>
        <Ionicons
          name={featureIcon(feature.id)}
          size={20}
          color={colors.brand}
        />
        <Text style={styles.label}>{feature.label}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.hint}>
          {feature.comingSoon
            ? "Soon"
            : feature.native
              ? "Open"
              : "Open on web"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.background },
  soon: { opacity: 0.5 },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 4 },
  label: { color: colors.text, fontSize: 16 },
  right: { flexDirection: "row", alignItems: "center" },
  hint: { color: colors.muted, fontSize: 13 },
});
