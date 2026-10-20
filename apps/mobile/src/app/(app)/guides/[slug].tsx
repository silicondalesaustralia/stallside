import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useToken } from "@/auth/useAuth";
import { useGuide } from "@/data/useGuides";
import { openGuide } from "@/lib/navigation";
import { openDashboardPath } from "@/lib/native-routes";
import { colors, spacing } from "@/lib/theme";
import GuideStepsCard from "@/components/GuideStepsCard";
import GuideRow from "@/components/GuideRow";
import ErrorMessage from "@/components/ErrorMessage";

export default function GuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const token = useToken();
  const guide = useGuide(slug);
  const data = guide.data;

  if (!data) {
    return (
      <View style={styles.center}>
        {guide.isPending ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <ErrorMessage error={guide.error} />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <GuideStepsCard data={data} />
      {data.links.length > 0 ? (
        <View style={styles.links}>
          {data.links.map((link) => (
            <Pressable
              key={link.href}
              accessibilityRole="link"
              onPress={() => openDashboardPath(link.href, token)}
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkLabel}>{link.label} ›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {data.related.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.heading}>Related</Text>
          {data.related.map((related) => (
            <GuideRow key={related.slug} guide={related} onPress={openGuide} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  links: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  link: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  linkLabel: { color: colors.brand, fontWeight: "600" },
  group: { gap: spacing.sm },
  heading: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
