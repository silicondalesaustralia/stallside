import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useToken } from "@/auth/useAuth";
import { useBusiness } from "@/business/useBusiness";
import { useQrCodes } from "@/data/useQr";
import { openQr } from "@/lib/navigation";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import QrRow from "@/components/QrRow";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";

export default function QrCodesScreen() {
  const token = useToken();
  const { businesses } = useBusiness();
  const codes = useQrCodes();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={codes.isRefetching}
          onRefresh={() => void codes.refetch()}
          tintColor={colors.brand}
        />
      }
    >
      <Text style={styles.heading}>Main business QR</Text>
      {businesses.map((business) => (
        <QrRow
          key={business.id}
          title={business.name}
          subtitle="Opens your shop checkout"
          onPress={() => openQr("business", business.id)}
        />
      ))}

      <Text style={styles.heading}>QR codes for pages</Text>
      <ErrorMessage error={codes.error} />
      {codes.isPending ? <ActivityIndicator color={colors.brand} /> : null}
      {codes.data?.codes.length === 0 ? (
        <Text style={styles.empty}>
          None yet. Make one for a category shelf, a product, a menu or your
          checkout.
        </Text>
      ) : null}
      {codes.data?.codes.map((qr) => (
        <QrRow
          key={qr.id}
          title={qr.name}
          badge={qr.atStall ? "At the stall" : undefined}
          subtitle={
            qr.destination
              ? `Opens ${qr.destination.label} · ${qr.standName}`
              : "Page removed, so scans open your website home."
          }
          warning={!qr.destination}
          onPress={() => openQr("code", qr.id)}
        />
      ))}

      <View style={styles.footer}>
        <PrimaryButton
          label="New QR code"
          onPress={() => void openOnWeb("/dashboard/qr/new", token)}
        />
        <Text style={styles.hint}>
          New codes and poster designs are made on the web.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg * 2,
  },
  heading: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  empty: { color: colors.muted, fontSize: 14 },
  footer: { gap: spacing.sm, marginTop: spacing.md },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
});
