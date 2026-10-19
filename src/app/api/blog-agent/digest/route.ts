import { NextResponse, type NextRequest } from "next/server";
import {
  blogAgentBadRequest,
  blogAgentUnauthorized,
  isBlogAgentRequest,
  readJsonBody,
} from "@/lib/blog/agent-auth";
import { digestSchema } from "@/lib/blog/agent-schemas";
import { adminBlogPath } from "@/lib/blog/paths";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize-blog-html";
import { blogDigestRecipients } from "@/lib/blog/digest-recipients";
import { SITE_URL } from "@/lib/legal";
import { sendOwnerEmail } from "@/lib/notify-email";

export const runtime = "nodejs";

/** Morning summary email: drafts to review, GSC opportunities, skipped news. */
export async function POST(req: NextRequest) {
  if (!isBlogAgentRequest(req)) return blogAgentUnauthorized();
  const body = await readJsonBody(req);
  if (body === null) return blogAgentBadRequest("Body must be JSON");
  const parsed = digestSchema.safeParse(body);
  if (!parsed.success) return blogAgentBadRequest("Invalid digest", parsed.error.issues);

  const reviewUrl = `${SITE_URL}${adminBlogPath()}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#182c1b">
${sanitizeBlogHtml(parsed.data.summaryHtml)}
<p style="margin-top:24px"><a href="${reviewUrl}">Open the blog review queue</a></p>
</div>`;

  try {
    await sendOwnerEmail(blogDigestRecipients(), parsed.data.subject, html, { kind: "blog-digest" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[blog-agent] digest send failed", error);
    return NextResponse.json({ error: "Failed to send digest" }, { status: 500 });
  }
}
