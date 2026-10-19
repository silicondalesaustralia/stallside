import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import type { QrImageResponse, QrKind } from "@contracts/mobile/qr";
import { useToken } from "@/auth/useAuth";
import { useQrImage } from "@/data/useQr";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

/** iOS can share the PNG itself; Android's share sheet only takes text, so it gets the link. */
async function shareQr(qr: QrImageResponse) {
  try {
    await Share.share(
      Platform.OS === "ios"
        ? { url: qr.image, message: qr.url }
        : { message: `${qr.name}: ${qr.url}` },
    );
  } catch (error) {
    Alert.alert(
      "Couldn't share",
      error instanceof Error ? error.message : "Try again.",
    );
  }
}

export default function QrScreen() {
  const params = useLocalSearchParams<{ kind: string; id: string }>();
  const kind: QrKind = params.kind === "business" ? "business" : "code";
  const token = useToken();
  const qr = useQrImage(kind, params.id);
  const data = qr.data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: data?.name ?? "QR code" }} />
      <ErrorMessage error={qr.error} />
      {qr.isPending ? (
        <ActivityIndicator color={colors.brand} style={styles.loading} />
      ) : null}
      {data ? (
        <>
          <View style={styles.card}>
            <Image
              source={{ uri: data.image }}
              style={styles.qr}
              resizeMode="contain"
              accessibilityLabel={`QR code for ${data.name}`}
            />
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.url} selectable>
              {data.url}
            </Text>
          </View>
          <Text style={styles.hint}>
            Customers can scan this straight off your screen.
          </Text>
          <PrimaryButton
            label="Share QR code"
            onPress={() => void shareQr(data)}
          />
          <Pressable
            accessibilityRole="link"
            onPress={() => void openOnWeb(data.webPath, token)}
            style={styles.web}
          >
            <Text style={styles.webLabel}>Design & print poster on web</Text>
          </Pressable>
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
  card: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  qr: { width: "100%", aspectRatio: 1, maxWidth: 360 },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  url: { color: colors.muted, fontSize: 12, textAlign: "center" },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  web: { alignItems: "center", paddingVertical: spacing.sm },
  webLabel: { color: colors.brand, fontSize: 15, fontWeight: "600" },
});
