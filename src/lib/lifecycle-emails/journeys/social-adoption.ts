import { socialDb } from "@/lib/socialHost/socialDb";

const PLATFORM_COLUMNS = [
  "facebook_page_id",
  "instagram_account_id",
  "linkedin_page_id",
  "gmb_location_id",
  "youtube_channel_id",
  "pinterest_user_id",
  "x_user_id",
] as const;

type PlatformRow = Partial<Record<(typeof PLATFORM_COLUMNS)[number], string | null>>;

/** Social platform and video-clip use across an owner's businesses; both false if Social is unreachable. */
export async function loadSocialAdoption(standIds: string[]): Promise<{ socialConnected: boolean; videoUsed: boolean }> {
  if (standIds.length === 0) return { socialConnected: false, videoUsed: false };
  try {
    const db = socialDb();
    const { data, error } = await db
      .from("businesses")
      .select(["id", ...PLATFORM_COLUMNS].join(","))
      .in("external_account_id", standIds);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as Array<PlatformRow & { id: string }>;
    if (rows.length === 0) return { socialConnected: false, videoUsed: false };
    const socialConnected = rows.some((row) => PLATFORM_COLUMNS.some((col) => Boolean(row[col])));
    const clips = await db
      .from("social_video_clip_jobs")
      .select("id", { count: "exact", head: true })
      .in("business_id", rows.map((row) => row.id));
    if (clips.error) throw new Error(clips.error.message);
    return { socialConnected, videoUsed: (clips.count ?? 0) > 0 };
  } catch (error) {
    console.error("[lifecycle] social adoption lookup failed", error);
    return { socialConnected: false, videoUsed: false };
  }
}
