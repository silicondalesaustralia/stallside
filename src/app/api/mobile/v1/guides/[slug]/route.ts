import type { NextRequest } from "next/server";
import type { GuideResponse } from "@/contracts/mobile/guides";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getArticle } from "@/lib/knowledge-base";
import { toGuideResponse } from "@/lib/mobile/guide-dto";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/guides/[slug]">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { slug } = await ctx.params;
    const article = getArticle(slug);
    if (!article) return mobileError(404, "Guide not found.");
    return mobileJson<GuideResponse>(toGuideResponse(article));
  } catch (error) {
    return mobileServerError("Mobile guide failed", error);
  }
}
