import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useReferrals } from "@/data/useReferrals";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import ReferralHowItWorksCard from "@/components/ReferralHowItWorksCard";
import ReferralLinkCard from "@/components/ReferralLinkCard";
import ReferralListCard from "@/components/ReferralListCard";
import ReferralNotOnProCard from "@/components/ReferralNotOnProCard";
import ReferralStatsGrid from "@/components/ReferralStatsGrid";

export default function ReferralsScreen() {
  const referrals = useReferrals();
  const data = referrals.data;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={referrals.isRefetching}
          onRefresh={() => void referrals.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <Text style={styles.muted}>
        Share Vendl and earn 50% of every Pro subscription you refer, for as
        long as they stay on Pro.
      </Text>
      <ErrorMessage error={referrals.error} />
      {referrals.isPending ? <ActivityIndicator color={colors.brand} /> : null}
      {data ? (
        <>
          {data.url ? (
            <ReferralLinkCard url={data.url} />
          ) : (
            <ReferralNotOnProCard hadLink={data.hadLink} />
          )}
          {data.stats ? (
            <>
              <ReferralStatsGrid stats={data.stats} />
              <ReferralListCard referrals={data.referrals} />
            </>
          ) : null}
        </>
      ) : null}
      <ReferralHowItWorksCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  muted: { color: colors.muted, fontSize: 14 },
});
