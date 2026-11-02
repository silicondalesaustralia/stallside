import { Pressable, StyleSheet, Text } from "react-native";
import type { BusinessDetailsResponse } from "@contracts/mobile/business";
import { useToken } from "@/auth/useAuth";
import { openLink } from "@/lib/open-link";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

/** Where shoppers find the business, plus the web-only branding and domain tools. */
export default function BusinessLinksCard({
  data,
}: {
  data: BusinessDetailsResponse;
}) {
  const token = useToken();
  const site = data.site;
  return (
    <Card title="Your pages">
      <Text style={styles.label}>Shoppers land on</Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => void openLink(data.publicUrl)}
      >
        <Text style={styles.link}>{data.publicLabel}</Text>
      </Pressable>
      <Text style={styles.label}>Your site URL</Text>
      {site ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void openLink(site.url)}
        >
          <Text style={styles.link}>{site.label}</Text>
        </Pressable>
      ) : (
        <Text style={styles.muted}>No website yet</Text>
      )}
      <Text style={styles.muted}>
        {site?.customDomain
          ? "Your connected domain."
          : "Your free Vendl address."}
        {site && !site.published ? " Not published yet." : ""}
      </Text>
      <Pressable
        accessibilityRole="button"
        style={styles.row}
        onPress={() =>
          void openOnWeb(`/dashboard/businesses/${data.id}?tab=branding`, token)
        }
      >
        <Text style={styles.action}>Edit logo and colours on the web</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={styles.row}
        onPress={() => void openOnWeb("/dashboard/website/domains", token)}
      >
        <Text style={styles.action}>
          {site?.customDomain ? "Manage domain" : "Connect a domain"} on the web
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  link: { color: colors.brand, fontSize: 15, textDecorationLine: "underline" },
  muted: { color: colors.muted, fontSize: 13 },
  row: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: { color: colors.brand, fontSize: 15, fontWeight: "600" },
});
