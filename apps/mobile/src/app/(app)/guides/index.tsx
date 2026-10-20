import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGuides } from "@/data/useGuides";
import { openGuide } from "@/lib/navigation";
import { colors, spacing } from "@/lib/theme";
import GuideRow from "@/components/GuideRow";
import SearchInput from "@/components/SearchInput";
import ErrorMessage from "@/components/ErrorMessage";

export default function GuidesScreen() {
  const guides = useGuides();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const categories = (guides.data?.categories ?? [])
    .map((category) => ({
      ...category,
      guides: category.guides.filter(
        (g) =>
          !needle ||
          g.title.toLowerCase().includes(needle) ||
          g.summary.toLowerCase().includes(needle),
      ),
    }))
    .filter((category) => category.guides.length > 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search guides"
      />
      <ErrorMessage error={guides.error} />
      {guides.isPending ? <ActivityIndicator color={colors.brand} /> : null}
      {categories.map((category) => (
        <View key={category.id} style={styles.group}>
          <Text style={styles.heading}>{category.title}</Text>
          {category.guides.map((guide) => (
            <GuideRow key={guide.slug} guide={guide} onPress={openGuide} />
          ))}
        </View>
      ))}
      {guides.data && categories.length === 0 ? (
        <Text style={styles.empty}>No guides match “{query.trim()}”.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg * 2,
  },
  group: { gap: spacing.sm },
  heading: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});
