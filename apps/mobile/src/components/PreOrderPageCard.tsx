import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import type { PreOrderDetailResponse } from "@contracts/mobile/preorders";
import { useToken } from "@/auth/useAuth";
import { useSetPreOrderActive } from "@/data/usePreOrders";
import { handoverLabel, preOrderDeadline } from "@/lib/preorder-labels";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import SwitchRow from "@/components/SwitchRow";

/** Collection details, on/off switch, share link and edit-on-web for one pre-order page. */
export default function PreOrderPageCard({
  detail,
}: {
  detail: PreOrderDetailResponse;
}) {
  const token = useToken();
  const setActive = useSetPreOrderActive();
  const { page } = detail;

  function toggle(isActive: boolean) {
    setActive.mutate(
      { id: page.id, isActive },
      {
        onError: (error) =>
          Alert.alert("Couldn't update pre-order page", error.message),
      },
    );
  }

  async function share() {
    try {
      await Share.share({
        message: `${page.title}: ${page.url}`,
        url: page.url,
      });
    } catch (error) {
      Alert.alert(
        "Couldn't share",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  return (
    <Card>
      <Text style={styles.title}>{page.title}</Text>
      <Text style={styles.line}>
        {handoverLabel(detail)} {page.collectionLabel}
      </Text>
      <Text style={page.ordersOpen ? styles.meta : styles.closed}>
        {preOrderDeadline(page)}
      </Text>
      {detail.collectionNote ? (
        <Text style={styles.meta}>{detail.collectionNote}</Text>
      ) : null}
      <SwitchRow
        label="On the shop"
        hint="Turn off to hide the page. Existing orders aren't affected."
        value={page.isActive}
        onChange={toggle}
      />
      <Text style={styles.url} selectable>
        {page.url}
      </Text>
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => void share()}>
          <Text style={styles.link}>Share link</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void openOnWeb(
              `/dashboard/pre-order-pages/${encodeURIComponent(page.id)}`,
              token,
            )
          }
        >
          <Text style={styles.link}>Edit on web</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  line: { color: colors.text, fontSize: 15 },
  meta: { color: colors.muted, fontSize: 14 },
  closed: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  url: { color: colors.muted, fontSize: 12 },
  links: { flexDirection: "row", gap: spacing.md },
  link: { color: colors.brand, fontWeight: "600" },
});
