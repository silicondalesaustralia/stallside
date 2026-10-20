import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCampaign } from "@/data/useCommunication";
import { campaignMeta, campaignStatus } from "@/lib/communication-labels";
import { formatDateTime, humanize } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import ErrorMessage from "@/components/ErrorMessage";

export default function CampaignScreen() {
  const { campaignId } = useLocalSearchParams<{ campaignId: string }>();
  const detail = useCampaign(campaignId);
  const data = detail.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={detail.isRefetching}
          onRefresh={() => void detail.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <Stack.Screen options={{ title: data?.campaign.name ?? "Message" }} />
      <ErrorMessage error={detail.error} />
      {detail.isPending ? (
        <ActivityIndicator color={colors.brand} style={styles.loading} />
      ) : null}
      {data ? (
        <>
          <Card>
            <Text style={styles.status}>
              {campaignStatus(data.campaign)} ·{" "}
              {formatDateTime(data.campaign.createdAt)}
            </Text>
            <Text style={styles.meta}>{campaignMeta(data.campaign)}</Text>
            {data.campaign.status === "SENDING" ? (
              <Text style={styles.meta}>
                Sending in the background. This updates by itself.
              </Text>
            ) : null}
          </Card>
          <Card>
            <Text style={styles.subject}>{data.subject}</Text>
            {data.heading ? (
              <Text style={styles.heading}>{data.heading}</Text>
            ) : null}
            <Text style={styles.body} selectable>
              {data.bodyText}
            </Text>
            {data.ctaLabel ? (
              <Text style={styles.meta}>
                Button: {data.ctaLabel} → {data.ctaUrl}
              </Text>
            ) : null}
          </Card>
          <Card title={`Recipients (${data.campaign.recipientCount})`}>
            {data.recipients.map((r) => (
              <View key={r.email} style={styles.row}>
                <Text style={styles.email} numberOfLines={1}>
                  {r.email}
                </Text>
                <Text style={r.status === "FAILED" ? styles.warn : styles.meta}>
                  {humanize(r.status)}
                  {r.errorMessage ? ` · ${r.errorMessage}` : ""}
                </Text>
              </View>
            ))}
            {data.campaign.recipientCount > data.recipients.length ? (
              <Text style={styles.meta}>
                Showing the first {data.recipients.length}.
              </Text>
            ) : null}
          </Card>
        </>
      ) : null}
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
  loading: { marginTop: spacing.lg },
  status: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13 },
  warn: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  subject: { color: colors.text, fontSize: 17, fontWeight: "700" },
  heading: { color: colors.text, fontSize: 15, fontWeight: "600" },
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  row: { flexDirection: "row", gap: spacing.sm, paddingVertical: 2 },
  email: { flex: 1, color: colors.text, fontSize: 14 },
});
