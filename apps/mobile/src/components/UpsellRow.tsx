import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { MobileUpsellRow } from "@contracts/mobile/upsells";
import { colors, spacing } from "@/lib/theme";

type Props = {
  upsell: MobileUpsellRow;
  onPress: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
};

export default function UpsellRow({ upsell, onPress, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(upsell.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>{upsell.name}</Text>
        <Text style={styles.meta}>Offers {upsell.offer}</Text>
        <Text style={styles.meta}>
          {upsell.scope} · {upsell.channels}
        </Text>
      </View>
      <Switch
        accessibilityLabel={`${upsell.name} turned on`}
        value={upsell.isActive}
        onValueChange={(value) => onToggle(upsell.id, value)}
        trackColor={{ true: colors.brand }}
      />
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
  meta: { color: colors.muted, fontSize: 13 },
});
