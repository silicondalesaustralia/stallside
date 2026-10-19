import { StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

export default function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
  return (
    <Text accessibilityRole="alert" style={styles.text}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.danger, fontSize: 14 },
});
