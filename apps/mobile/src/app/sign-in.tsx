import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useAuth } from "@/auth/useAuth";
import { colors, spacing } from "@/lib/theme";
import EmailStep from "@/components/EmailStep";
import CodeStep from "@/components/CodeStep";

export default function SignIn() {
  const { state } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  if (state.status === "signedIn") return <Redirect href="/home" />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Image
            source={require("../../assets/brand/logo-lockup.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Vendl"
          />
          <Text style={styles.subtitle}>Sign in to manage your business.</Text>
          {email ? (
            <CodeStep email={email} onBack={() => setEmail(null)} />
          ) : (
            <EmailStep onSent={setEmail} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  logo: { width: 180, height: 48 },
  subtitle: { color: colors.muted, fontSize: 16, marginBottom: spacing.md },
});
