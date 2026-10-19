import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import type { AlertSettingsBody } from "@contracts/mobile/notifications";
import { useAlertSettings, useSaveAlertSettings } from "@/data/useAlertSettings";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

type Row = { key: keyof AlertSettingsBody; label: string; note: string };

/** Same switches as the web alert settings; phone alerts are delivered to this app. */
export default function AlertSettingsCard() {
  const settings = useAlertSettings();
  const save = useSaveAlertSettings();
  const data = settings.data;
  if (!data) return null;

  const phones = data.appDevices === 1 ? "this app" : `the app on ${data.appDevices} phones`;
  const rows: Row[] = [
    {
      key: "pushAlertsEnabled",
      label: "Phone alerts",
      note: data.appDevices > 0 ? `Sales, low stock and sold out go to ${phones}.` : "Allow notifications for Vendl in your phone settings.",
    },
    { key: "emailAlertsEnabled", label: "Email alerts", note: `Sent to ${data.contactEmail}.` },
  ];

  function toggle(key: Row["key"], value: boolean) {
    save.mutate({ [key]: value }, { onError: (error) => Alert.alert("Couldn't save", error.message) });
  }

  return (
    <Card title="Alerts">
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.text}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.note}>{row.note}</Text>
          </View>
          <Switch
            value={data[row.key]}
            disabled={save.isPending}
            onValueChange={(value) => toggle(row.key, value)}
            trackColor={{ true: colors.brand, false: colors.border }}
          />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  text: { flex: 1, gap: 2 },
  label: { color: colors.text, fontSize: 15, fontWeight: "600" },
  note: { color: colors.muted, fontSize: 13 },
});
