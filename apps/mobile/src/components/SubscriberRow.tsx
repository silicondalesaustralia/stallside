import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { MobileSubscriber } from "@contracts/mobile/subscriptions";
import { SUBSCRIBER_STATUS_LABEL } from "@/lib/subscription-labels";
import { mailtoUrl, openLink } from "@/lib/open-link";
import { colors, spacing } from "@/lib/theme";

function nextLabel(iso: string | null): string {
  if (!iso) return "";
  return ` · next ${new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}`;
}

export default function SubscriberRow({ subscriber }: { subscriber: MobileSubscriber }) {
  const { customerId, customerPhone } = subscriber;
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{subscriber.customerName}</Text>
      <Text style={styles.meta}>
        {SUBSCRIBER_STATUS_LABEL[subscriber.status]}
        {subscriber.status === "CANCELLED" ? "" : nextLabel(subscriber.nextCollectionAt)}
      </Text>
      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => void openLink(mailtoUrl(subscriber.customerEmail))}>
          <Text style={styles.link}>Email</Text>
        </Pressable>
        {customerPhone ? (
          <Pressable accessibilityRole="link" onPress={() => void openLink(`tel:${customerPhone}`)}>
            <Text style={styles.link}>Call</Text>
          </Pressable>
        ) : null}
        {customerId ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push({ pathname: "/customers/[customerId]", params: { customerId } })}
          >
            <Text style={styles.link}>Customer</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 13 },
  links: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  link: { color: colors.brand, fontWeight: "600" },
});
