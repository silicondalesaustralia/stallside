import { StyleSheet, Text, View } from "react-native";
import type { MobileReferral } from "@contracts/mobile/referrals";
import { dayLabel } from "@/lib/material-labels";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

/** Businesses that joined through the owner's link and what each has earned. */
export default function ReferralListCard({
  referrals,
}: {
  referrals: MobileReferral[];
}) {
  return (
    <Card title="Your referrals">
      {referrals.length === 0 ? (
        <Text style={styles.muted}>
          No signups yet. Share your link to get started.
        </Text>
      ) : (
        referrals.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {r.businessName}
              </Text>
              <Text style={styles.muted}>
                Joined {dayLabel(r.joinedOn)} · {r.status}
              </Text>
            </View>
            <View style={styles.side}>
              <Text style={styles.name}>{r.earnedLabel}</Text>
              <Text style={styles.small}>earned</Text>
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  body: { flex: 1, gap: 2 },
  side: { alignItems: "flex-end", gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 13 },
  small: { color: colors.muted, fontSize: 12 },
});
