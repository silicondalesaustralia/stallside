import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Device from "expo-device";
import { otpVerifyResponse } from "@contracts/mobile/auth";
import { apiFetch } from "@/lib/api";
import { APP_VERSION } from "@/lib/config";
import { colors, spacing } from "@/lib/theme";
import { useAuth } from "@/auth/useAuth";
import PrimaryButton from "@/components/PrimaryButton";
import ErrorMessage from "@/components/ErrorMessage";

export default function CodeStep({ email, onBack }: { email: string; onBack: () => void }) {
  const { signIn } = useAuth();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function verify() {
    const cleaned = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleaned)) {
      setError(new Error("Enter the 6-digit code from your email."));
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const result = await apiFetch("/auth/otp/verify", {
        method: "POST",
        body: {
          email,
          code: cleaned,
          platform: Platform.OS === "android" ? "android" : "ios",
          deviceName: Device.deviceName ?? undefined,
          appVersion: APP_VERSION,
        },
        schema: otpVerifyResponse,
      });
      await signIn(result.token);
    } catch (err) {
      setError(err);
      setVerifying(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>We emailed a 6-digit code to {email}.</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={7}
        placeholder="123456"
        onSubmitEditing={verify}
      />
      <ErrorMessage error={error} />
      <PrimaryButton label="Sign in" onPress={verify} loading={verifying} />
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.link}>Use a different email</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hint: { color: colors.muted },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 24,
    letterSpacing: 6,
    textAlign: "center",
    color: colors.text,
  },
  link: { color: colors.brand, textAlign: "center", fontWeight: "600" },
});
