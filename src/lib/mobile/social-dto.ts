import type { MobileSocialPost, SocialResponse } from "@/contracts/mobile/social";
import { loadStandSocialPosts, type StandSocialPost } from "@/lib/social/loadStandSocialPosts";

function toMobilePost(post: StandSocialPost): MobileSocialPost {
  const photos = post.photo_urls ?? [];
  return {
    id: post.id,
    status: post.status,
    manual: post.publishing_mode === "manual",
    caption: post.caption ?? "",
    platforms: post.platforms ?? [],
    photoUrl: photos[0] ?? null,
    photoCount: photos.length,
    scheduledFor: post.scheduled_for,
    postedAt: post.posted_at,
    createdAt: post.created_at,
  };
}

/** Scheduled, draft and recent posts for one business. */
export async function loadSocialResponse(standId: string): Promise<SocialResponse> {
  const posts = await loadStandSocialPosts(standId);
  return {
    started: posts.started,
    scheduled: posts.scheduled.map(toMobilePost),
    drafts: posts.drafts.map(toMobilePost),
    history: posts.history.map(toMobilePost),
  };
}
