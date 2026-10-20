import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useAuth } from "@/auth/useAuth";
import { useDeleteAccount } from "@/data/useAccount";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

const CONSEQUENCES = [
  "Your Vendl subscription is cancelled immediately",
  "Marketing, sale and alert emails stop",
  "Phone push alerts stop",
  "Your stands go offline (QR links stop working)",
  "Your account data is kept on file",
].join("\n• ");

export default function DeleteAccountCard() {
  const { signOut } = useAuth();
  const remove = useDeleteAccount();

  function confirm() {
    Alert.alert(
      "Delete your account?",
      `• ${CONSEQUENCES}\n\nThis cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () =>
            remove.mutate(undefined, {
              onSuccess: () => void signOut(),
              onError: (error) =>
                Alert.alert("Couldn't delete account", error.message),
            }),
        },
      ],
    );
  }

  return (
    <Card title="Delete account">
      <Text style={styles.hint}>
        Close your Vendl account. Emails and live stands stop.
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={remove.isPending}
        onPress={confirm}
        style={styles.button}
      >
        <Text style={styles.label}>
          {remove.isPending ? "Deleting…" : "Delete account"}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 13 },
  button: {
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  label: { color: colors.danger, fontSize: 15, fontWeight: "600" },
});
