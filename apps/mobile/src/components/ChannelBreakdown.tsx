import { StyleSheet, Text, View } from "react-native";
import type { HomeResponse } from "@contracts/mobile/home";
import { formatCents } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

const CHANNELS = [
  { key: "stand", label: "Stall & shop" },
  { key: "preorder", label: "Pre-orders" },
  { key: "subscription", label: "Subscriptions" },
] as const;

export default function ChannelBreakdown({ sales }: { sales: HomeResponse["sales"] }) {
  return (
    <Card title="By channel">
      {CHANNELS.map(({ key, label }) => {
        const summary = sales[key];
        return (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>
              {formatCents(summary.salesCents, summary.currency)}
              <Text style={styles.count}> · {summary.orderCount}</Text>
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  label: { color: colors.text, fontSize: 15 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600" },
  count: { color: colors.muted, fontWeight: "400" },
});
