import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileCampaignRow } from "@contracts/mobile/communication";
import { campaignMeta, campaignStatus } from "@/lib/communication-labels";
import { formatDateTime } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

type Props = { campaign: MobileCampaignRow; onPress: (id: string) => void };

export default function CampaignRow({ campaign, onPress }: Props) {
  const problem = campaign.status === "FAILED" || campaign.failedCount > 0;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(campaign.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={1}>
          {campaign.name}
        </Text>
        <Text style={problem ? styles.warn : styles.status}>
          {campaignStatus(campaign)}
        </Text>
      </View>
      <Text style={styles.meta}>{campaignMeta(campaign)}</Text>
      <Text style={styles.meta}>{formatDateTime(campaign.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 2,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700" },
  status: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  warn: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
});
