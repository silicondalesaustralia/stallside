import type { BlogTopic } from "@/generated/prisma/client";
import { SITE_URL } from "@/lib/legal";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { adminBlogPath, blogPickPath } from "./paths";
import { createPickToken } from "./pick-token";
import { MAX_PICKS_PER_BATCH } from "./recommendation-schemas";
import { parseTargetQueries } from "./types";

type EmailTopic = Pick<
  BlogTopic,
  "id" | "title" | "angle" | "notes" | "featureRef" | "section" | "source" | "targetPostSlug" | "targetQueries" | "recommendationRank"
>;

function topicCard(topic: EmailTopic): string {
  const pickUrl = `${SITE_URL}${blogPickPath(createPickToken(topic.id))}`;
  const kind = topic.targetPostSlug ? `Update /${escapeHtml(topic.targetPostSlug)}` : "New post";
  const section = topic.section === "NEWS" ? "News" : "Guide";
  const queries = parseTargetQueries(topic.targetQueries)
    .slice(0, 3)
    .map((q) => `“${escapeHtml(q.query)}”${q.impressions ? ` (${q.impressions} impr.)` : ""}`)
    .join(", ");

  return `<tr><td style="padding:16px 0;border-bottom:1px solid #e5e2d8">
<p style="margin:0;font-size:12px;color:#6b6b5e;text-transform:uppercase;letter-spacing:.04em">#${topic.recommendationRank ?? ""} · ${kind} · ${section} · ${escapeHtml(topic.source.replace("_", " ").toLowerCase())}</p>
<p style="margin:6px 0 4px;font-size:17px;font-weight:bold;color:#182c1b">${escapeHtml(topic.title)}</p>
<p style="margin:0 0 6px;color:#333">${escapeHtml(topic.angle ?? "")}</p>
${topic.featureRef ? `<p style="margin:0 0 6px;color:#2f6b3a;font-size:14px"><strong>Vendl tie-in:</strong> ${escapeHtml(topic.featureRef)}</p>` : ""}
${topic.notes ? `<p style="margin:0 0 6px;color:#555;font-size:14px"><strong>Why now:</strong> ${escapeHtml(topic.notes)}</p>` : ""}
${queries ? `<p style="margin:0 0 10px;color:#555;font-size:14px"><strong>Targets:</strong> ${queries}</p>` : ""}
<a href="${pickUrl}" style="display:inline-block;background:#2f6b3a;color:#fff;text-decoration:none;padding:9px 18px;border-radius:999px;font-weight:bold;font-size:14px">Write this</a>
</td></tr>`;
}

/** Evening email: ranked ideas, each with a signed one-click "Write this" link. */
export function recommendationEmailHtml(topics: EmailTopic[], summary?: string): string {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#182c1b;max-width:640px">
<p>Here are ${topics.length} ideas for tomorrow's blog. Pick up to ${MAX_PICKS_PER_BATCH}; each one you click is researched and drafted straight away, with images, ready for review in the morning. If you don't pick any, nothing is written.</p>
${summary ? `<p style="color:#555">${escapeHtml(summary)}</p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${topics.map(topicCard).join("")}</table>
<p style="margin-top:20px;font-size:13px;color:#6b6b5e">Links expire in 48 hours. All ideas stay in the <a href="${SITE_URL}${adminBlogPath("topics")}">topic backlog</a>.</p>
</div>`;
}
