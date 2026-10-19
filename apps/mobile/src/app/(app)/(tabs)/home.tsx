import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { HomeRange } from "@contracts/mobile/home";
import { useBusiness } from "@/business/useBusiness";
import { useHome } from "@/data/useHome";
import { useMe } from "@/data/useMe";
import { colors, spacing } from "@/lib/theme";
import BusinessSwitcher from "@/components/BusinessSwitcher";
import QuickActions from "@/components/QuickActions";
import RangeChips from "@/components/RangeChips";
import SalesHeadline from "@/components/SalesHeadline";
import ChannelBreakdown from "@/components/ChannelBreakdown";
import LowStockCard from "@/components/LowStockCard";
import RecentOrdersCard from "@/components/RecentOrdersCard";
import ErrorMessage from "@/components/ErrorMessage";

export default function HomeScreen() {
  const me = useMe();
  const { selected } = useBusiness();
  const [range, setRange] = useState<HomeRange>("today");
  const home = useHome(selected?.id ?? null, range);

  if (me.isPending || (selected && home.isPending)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!selected) {
    return (
      <View style={styles.center}>
        <ErrorMessage error={me.error} />
        {!me.error ? <Text style={styles.muted}>Set up your first business on the web to get started.</Text> : null}
      </View>
    );
  }

  const data = home.data;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={home.isRefetching} onRefresh={() => void home.refetch()} tintColor={colors.brand} />
      }
    >
      <View style={styles.bleed}>
        <BusinessSwitcher />
      </View>
      <Text style={styles.greeting}>{selected.name}</Text>
      <QuickActions />
      <RangeChips value={range} onChange={setRange} />
      <ErrorMessage error={home.error} />
      {data ? (
        <>
          <SalesHeadline label={data.range.label} current={data.sales.all} previous={data.previous} />
          <ChannelBreakdown sales={data.sales} />
          <LowStockCard items={data.lowStock} />
          <RecentOrdersCard orders={data.recentOrders} />
          <Text style={styles.footer}>
            {data.productCount} products · {data.preOrderPageCount} pre-order pages · {data.activeSubscriptions} live
            subscriptions
          </Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  muted: { color: colors.muted, textAlign: "center" },
  screen: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  bleed: { marginHorizontal: -spacing.md },
  greeting: { color: colors.text, fontSize: 24, fontWeight: "800" },
  footer: { color: colors.muted, fontSize: 13, textAlign: "center", marginBottom: spacing.lg },
});
