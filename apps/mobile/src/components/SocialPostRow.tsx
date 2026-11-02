import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  socialPlatformLabel,
  type MobileSocialPost,
} from "@contracts/mobile/social";
import { formatDateTime } from "@/lib/format";
import { colors, spacing } from "@/lib/theme";

type Props = {
  post: MobileSocialPost;
  onPress: (post: MobileSocialPost) => void;
};

function when(post: MobileSocialPost): string {
  if (post.status === "posted") {
    return `Posted ${formatDateTime(post.postedAt ?? post.createdAt)}`;
  }
  if (post.status === "failed") return "Didn't post";
  if (post.status === "scheduled" && post.scheduledFor) {
    return `${post.manual ? "Reminder" : "Posts"} ${formatDateTime(post.scheduledFor)}`;
  }
  return `Draft · ${formatDateTime(post.createdAt)}`;
}

/** Photo, caption, platforms and timing for one social post. */
export default function SocialPostRow({ post, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(post)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {post.photoUrl ? (
        <Image source={{ uri: post.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.noPhoto]} />
      )}
      <View style={styles.body}>
        <Text style={[styles.when, post.status === "failed" && styles.failed]}>
          {when(post)}
        </Text>
        <Text style={styles.caption} numberOfLines={3}>
          {post.caption || "No caption"}
        </Text>
        <Text style={styles.meta}>
          {post.platforms.map(socialPlatformLabel).join(" · ")}
          {post.photoCount > 1 ? ` · ${post.photoCount} photos` : ""}
          {post.manual && post.status === "scheduled"
            ? " · post it yourself"
            : ""}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  photo: { width: 64, height: 64, borderRadius: 10 },
  noPhoto: { backgroundColor: colors.background },
  body: { flex: 1, gap: 2 },
  when: { color: colors.text, fontSize: 13, fontWeight: "700" },
  failed: { color: colors.danger },
  caption: { color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12 },
});
