import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { mobileOk } from "@contracts/mobile/common";
import { apiFetch } from "@/lib/api";
import { colors, spacing } from "@/lib/theme";
import PrimaryButton from "@/components/PrimaryButton";
import ErrorMessage from "@/components/ErrorMessage";

export default function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function send() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setError(new Error("Enter the email you use for Vendl."));
      return;
    }
    setSending(true);
    setError(null);
    try {
      await apiFetch("/auth/otp/request", {
        method: "POST",
        body: { email: trimmed },
        schema: mobileOk,
      });
      onSent(trimmed);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        returnKeyType="send"
        onSubmitEditing={send}
      />
      <ErrorMessage error={error} />
      <PrimaryButton label="Email me a code" onPress={send} loading={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  label: { color: colors.text, fontWeight: "600" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
});
