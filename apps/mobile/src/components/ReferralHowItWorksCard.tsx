import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";

const STEPS = [
  {
    title: "Share your link",
    body: "Post it in groups, send it to other makers, or add it to your socials.",
  },
  {
    title: "They join Vendl",
    body: "Anyone who signs up within 90 days of clicking your link is linked to you.",
  },
  {
    title: "Earn 50% for life",
    body: "When they pay for Pro, you earn 50% of every payment (excluding tax) for as long as they stay on Pro.",
  },
  {
    title: "Get paid",
    body: "We pay out manually. Commission only counts for payments made while you're on Pro yourself.",
  },
] as const;

export default function ReferralHowItWorksCard() {
  return (
    <Card title="How it works">
      {STEPS.map((step, i) => (
        <View key={step.title} style={styles.step}>
          <Text style={styles.number}>{i + 1}</Text>
          <View style={styles.body}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.text}>{step.body}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: "row", gap: spacing.sm + 4 },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.brand,
    color: colors.brandText,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "700",
  },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 14, fontWeight: "700" },
  text: { color: colors.muted, fontSize: 13 },
});
