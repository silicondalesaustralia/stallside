import { Pressable, StyleSheet, Text, View } from "react-native";
import type {
  PaymentsResponse,
  ProviderStatus,
} from "@contracts/mobile/payments";
import { useToken } from "@/auth/useAuth";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
const STATUS_LABEL: Record<ProviderStatus, string> = {
  connected: "Connected",
  finish_setup: "Finish setup",
  not_connected: "Not connected",
};

type Props = { data: PaymentsResponse };

/** Stripe / Square connection state. Connecting happens on the web (bank and ID checks). */
export default function PaymentProvidersCard({ data }: Props) {
  const token = useToken();
  const providers = [
    {
      name: "Stripe (card / Tap & Go)",
      status: data.stripe,
      path: "/dashboard/settings/stripe",
    },
    ...(data.square
      ? [
          {
            name: "Square",
            status: data.square,
            path: "/dashboard/settings/square",
          },
        ]
      : []),
  ];
  return (
    <Card title="Card payments">
      {providers.map((provider) => (
        <View key={provider.name} style={styles.row}>
          <View style={styles.text}>
            <Text style={styles.name}>{provider.name}</Text>
            <Text
              style={provider.status === "connected" ? styles.ok : styles.todo}
            >
              {STATUS_LABEL[provider.status]}
            </Text>
          </View>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => void openOnWeb(provider.path, token)}
          >
            <Text style={styles.link}>
              {provider.status === "connected" ? "Manage" : "Set up"}
            </Text>
          </Pressable>
        </View>
      ))}
      <Text style={styles.hint}>
        Pre-orders and subscriptions need Stripe. Cash and PayID work without
        it.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  text: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  ok: { color: colors.brand, fontSize: 13, fontWeight: "600" },
  todo: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  hint: { color: colors.muted, fontSize: 13 },
  link: { color: colors.brand, fontSize: 15, fontWeight: "600" },
});
