import { StyleSheet, View } from "react-native";
import type { ReferralsResponse } from "@contracts/mobile/referrals";
import { spacing } from "@/lib/theme";
import StatTile from "@/components/StatTile";

type Stats = NonNullable<ReferralsResponse["stats"]>;

/** Clicks, signups and commission, as on the web Referrals page. */
export default function ReferralStatsGrid({ stats }: { stats: Stats }) {
  return (
    <View style={styles.grid}>
      <StatTile label="Link clicks" value={String(stats.clicks)} />
      <StatTile label="Signups" value={String(stats.signups)} />
      <StatTile label="Live Pro" value={String(stats.livePro)} />
      <StatTile
        label="Monthly commission"
        value={stats.monthlyCommission}
        hint="Estimate from current Pro referrals"
      />
      <StatTile
        label="Owed to you"
        value={stats.owed}
        hint="Paid out manually"
      />
      <StatTile label="Paid to date" value={stats.paid} />
      {stats.missed ? (
        <StatTile
          label="Missed"
          value={stats.missed}
          hint="Earned while you weren't on Pro"
          warn
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
