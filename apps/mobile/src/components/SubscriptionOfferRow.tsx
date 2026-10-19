import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { MobileOffer } from "@contracts/mobile/subscriptions";
import { offerFlags, offerMeta } from "@/lib/subscription-labels";
import { colors, spacing } from "@/lib/theme";

type Props = {
  offer: MobileOffer;
  onPress: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
};

export default function SubscriptionOfferRow({ offer, onPress, onToggle }: Props) {
  const flags = offerFlags(offer).filter((flag) => flag !== "Off");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(offer.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <Text style={styles.title}>
          {offer.title}
          {offer.kind === "MEMBERSHIP" ? <Text style={styles.kind}> · membership</Text> : null}
        </Text>
        <Text style={styles.meta}>{offerMeta(offer)}</Text>
        {flags.length ? <Text style={styles.warn}>{flags.join(" · ")}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={`${offer.title} open for sign-ups`}
        value={offer.isActive}
        onValueChange={(value) => onToggle(offer.id, value)}
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
  kind: { color: colors.muted, fontWeight: "400" },
  meta: { color: colors.muted, fontSize: 13 },
  warn: { color: colors.danger, fontSize: 12, fontWeight: "600" },
});
