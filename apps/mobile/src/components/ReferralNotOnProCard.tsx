import { StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";

/** Billing isn't linked from the app (App Store rules), so this only explains the program. */
export default function ReferralNotOnProCard({
  hadLink,
}: {
  hadLink: boolean;
}) {
  return (
    <Card title="Referrals are for Pro members">
      <Text style={styles.muted}>
        {hadLink
          ? "Your referral link is paused. Referrals stay linked to you, but commission on payments made while you're not on Pro is lost."
          : "Pro members get a personal link and earn 50% of every Pro subscription they refer."}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 14 },
});
