import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MobileSocialPost } from "@contracts/mobile/social";
import { useToken } from "@/auth/useAuth";
import { useBusiness } from "@/business/useBusiness";
import { useSocial } from "@/data/useSocial";
import { openOnWeb } from "@/lib/open-web";
import { colors, spacing } from "@/lib/theme";
import ErrorMessage from "@/components/ErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";
import SocialPostRow from "@/components/SocialPostRow";

export default function SocialScreen() {
  const token = useToken();
  const { selected } = useBusiness();
  const social = useSocial(selected?.id ?? null);
  const data = social.data;

  const sections = data
    ? [
        { title: "Scheduled", data: data.scheduled },
        { title: "Drafts", data: data.drafts },
        { title: "Posted", data: data.history },
      ].filter((section) => section.data.length > 0)
    : [];

  function openPost(post: MobileSocialPost) {
    const page =
      post.status === "posted" || post.status === "failed"
        ? "/dashboard/social/posts"
        : "/dashboard/social/calendar";
    void openOnWeb(page, token);
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.muted}>
        Your scheduled, draft and recent posts. Create and edit posts on the
        web.
      </Text>
      <ErrorMessage error={social.error} />
      <PrimaryButton
        label="Create a post on the web"
        onPress={() => void openOnWeb("/dashboard/social/create", token)}
      />
      {data && !data.started ? (
        <Text style={styles.muted}>
          Open Social on the web once to set up your brand and connect your
          accounts.
        </Text>
      ) : null}
    </View>
  );

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => (
        <SocialPostRow post={item} onPress={openPost} />
      )}
      renderSectionHeader={({ section }) => (
        <Text style={styles.section}>{section.title}</Text>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        social.isPending && selected ? (
          <ActivityIndicator color={colors.brand} style={styles.loading} />
        ) : data?.started ? (
          <Text style={styles.empty}>No posts yet.</Text>
        ) : undefined
      }
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={social.isRefetching}
          onRefresh={() => void social.refetch()}
          tintColor={colors.brand}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  muted: { color: colors.muted, fontSize: 14 },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  loading: { marginTop: spacing.lg },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.md },
});
