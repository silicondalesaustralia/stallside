import { Image, StyleSheet, Text, View } from "react-native";
import type { GuideResponse } from "@contracts/mobile/guides";
import { API_URL } from "@/lib/config";
import { openLink } from "@/lib/open-link";
import { colors, spacing } from "@/lib/theme";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";

type Props = { data: GuideResponse };

/** Summary, optional picture and video, then the numbered steps. */
export default function GuideStepsCard({ data }: Props) {
  const { guide, image, videoUrl } = data;
  return (
    <Card>
      <Text style={styles.title}>{guide.title}</Text>
      <Text style={styles.summary}>{guide.summary}</Text>
      {image ? (
        <Image
          source={{ uri: `${API_URL}${image.path}` }}
          accessibilityLabel={image.alt}
          style={[styles.image, { aspectRatio: image.aspectRatio ?? 4 / 3 }]}
          resizeMode="contain"
        />
      ) : null}
      {videoUrl ? (
        <PrimaryButton
          label="Watch the video"
          onPress={() => void openLink(videoUrl)}
        />
      ) : null}
      {data.steps.map((step, index) => (
        <View key={step} style={styles.step}>
          <Text style={styles.number}>{index + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  summary: { color: colors.muted, fontSize: 15 },
  image: { width: "100%", borderRadius: 12 },
  step: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.xs },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandText,
    backgroundColor: colors.brand,
  },
  stepText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21 },
});
