import { StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

export default function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <Text style={styles.stars} accessibilityLabel={`${filled} out of 5 stars`}>
      {"★".repeat(filled)}
      <Text style={styles.empty}>{"★".repeat(5 - filled)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: { color: "#f59e0b", fontSize: 18, letterSpacing: 1 },
  empty: { color: colors.border },
});
