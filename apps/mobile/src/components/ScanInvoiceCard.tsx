import { ActivityIndicator, Alert, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { INVOICE_PHOTO_MAX_BYTES } from "@contracts/mobile/invoice-scan";
import { useScanInvoice } from "@/data/useInvoiceScan";
import { pickPhoto } from "@/lib/pick-photo";
import { colors } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

/** Same as "Scan an invoice" on the web Materials page: photo in, lines to review out. */
export default function ScanInvoiceCard({ standId }: { standId: string }) {
  const scan = useScanInvoice(standId);

  async function scanFrom(source: "camera" | "library") {
    try {
      const photo = await pickPhoto(source, {
        purpose: "scan invoices",
        maxBytes: INVOICE_PHOTO_MAX_BYTES,
      });
      if (!photo) return;
      scan.mutate(photo, {
        onSuccess: () => router.push("/production/materials/scan"),
        onError: (error) => Alert.alert("Couldn't read that", error.message),
      });
    } catch (error) {
      Alert.alert(
        "Couldn't open photos",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }

  function chooseSource() {
    Alert.alert("Scan an invoice", undefined, [
      { text: "Take photo", onPress: () => void scanFrom("camera") },
      { text: "Choose from library", onPress: () => void scanFrom("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <Card title="Scan an invoice or receipt">
      <Text style={styles.hint}>
        Photograph a supplier invoice. Vendl reads the items and prices, matches
        them to your materials, and you check everything before it&apos;s saved.
      </Text>
      {scan.isPending ? (
        <Text style={styles.reading}>
          <ActivityIndicator color={colors.brand} /> Reading the invoice… this
          can take up to a minute.
        </Text>
      ) : null}
      <PrimaryButton
        label="Scan invoice"
        loading={scan.isPending}
        onPress={chooseSource}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
  reading: { color: colors.text, fontSize: 13 },
});
