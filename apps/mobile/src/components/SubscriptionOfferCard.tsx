import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import type { MobileOffer } from "@contracts/mobile/subscriptions";
import { useToken } from "@/auth/useAuth";
import { useSetOfferActive } from "@/data/useSubscriptions";
import { offerFlags, offerMeta } from "@/lib/subscription-labels";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import SwitchRow from "@/components/SwitchRow";

/** Summary, open/closed switch, share link and edit-on-web for one offer. */
export default function SubscriptionOfferCard({ offer }: { offer: MobileOffer }) {
  const token = useToken();
  const setActive = useSetOfferActive();
  const flags = offerFlags(offer).filter((flag) => flag !== "Off");

  function toggle(isActive: boolean) {
    setActive.mutate(
      { id: offer.id, isActive },
      { onError: (error) => Alert.alert("Couldn't update subscription", error.message) },
    );
  }

  async function share() {
    try {
      await Share.share({ message: `${offer.title}: ${offer.url}`, url: offer.url });
    } catch (error) {
      Alert.alert("Couldn't share", error instanceof Error ? error.message : "Try again.");
    }
  }

  return (
    <Card>
      <Text style={styles.title}>{offer.title}</Text>
      <Text style={styles.meta}>{offerMeta(offer)}</Text>
      {flags.length ? <Text style={styles.warn}>{flags.join(" · ")}</Text> : null}
      <SwitchRow
        label="Open for sign-ups"
        hint="Existing subscribers aren't affected."
        value={offer.isActive}
        onChange={toggle}
      />
      <Text style={styles.url} selectable>
        {offer.url}
      </Text>
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => void share()}>
          <Text style={styles.link}>Share link</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => void openOnWeb(`/dashboard/subscriptions/${encodeURIComponent(offer.id)}`, token)}
        >
          <Text style={styles.link}>Edit on web</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 14 },
  warn: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  url: { color: colors.muted, fontSize: 12 },
  links: { flexDirection: "row", gap: spacing.md },
  link: { color: colors.brand, fontWeight: "600" },
});
