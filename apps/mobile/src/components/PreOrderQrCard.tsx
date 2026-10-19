import {
  Alert,
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
} from "react-native";
import type { PreOrderDetailResponse } from "@contracts/mobile/preorders";
import { useToken } from "@/auth/useAuth";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

/** iOS can share the PNG itself; Android's share sheet only takes text, so it gets the link. */
export default function PreOrderQrCard({
  detail,
}: {
  detail: PreOrderDetailResponse;
}) {
  const token = useToken();
  const { page } = detail;

  async function share() {
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { url: detail.qrImage, message: page.url }
          : { message: `${page.title}: ${page.url}` },
      );
    } catch (error) {
      Alert.alert(
        "Couldn't share",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  const shareButton = (
    <Pressable accessibilityRole="button" onPress={() => void share()}>
      <Text style={styles.link}>Share</Text>
    </Pressable>
  );

  return (
    <Card title="QR code" action={shareButton}>
      <Image
        source={{ uri: detail.qrImage }}
        style={styles.qr}
        resizeMode="contain"
        accessibilityLabel={`QR code for ${page.title}`}
      />
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          void openOnWeb(
            `/dashboard/pre-order-pages/${encodeURIComponent(page.id)}/qr`,
            token,
          )
        }
        style={styles.web}
      >
        <Text style={styles.link}>Design & print poster on web</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  qr: { width: "100%", aspectRatio: 1, maxWidth: 280, alignSelf: "center" },
  web: { alignItems: "center", paddingTop: spacing.xs },
  link: { color: colors.brand, fontWeight: "600" },
});
