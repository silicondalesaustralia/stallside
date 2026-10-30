import { Alert, Share, StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** The owner's referral link with the phone's share sheet (which includes Copy). */
export default function ReferralLinkCard({ url }: { url: string }) {
  async function share() {
    try {
      await Share.share({
        message: `I sell with Vendl. Set up your own online shop here: ${url}`,
        url,
      });
    } catch (error) {
      Alert.alert(
        "Couldn't share",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  return (
    <Card title="Your referral link">
      <Text style={styles.hint}>
        Anyone who signs up within 90 days of clicking this link is linked to
        you.
      </Text>
      <Text selectable style={styles.url}>
        {url}
      </Text>
      <PrimaryButton label="Share link" onPress={() => void share()} />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
  url: { color: colors.text, fontSize: 15, fontWeight: "600" },
});
