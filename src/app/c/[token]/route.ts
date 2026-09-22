import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const url = new URL(request.url);
  const to = url.searchParams.get("to");
  const base = appBaseUrl();

  const click = await prisma.campaignClick.findUnique({
    where: { token },
    include: { campaign: { select: { ctaUrl: true, id: true } } },
  });

  if (!click) {
    return NextResponse.redirect(base);
  }

  await prisma.campaign.update({
    where: { id: click.campaignId },
    data: { clickCount: { increment: 1 } },
  });

  let dest = to || click.campaign.ctaUrl || base;
  if (!dest.startsWith("http")) {
    dest = `${base}${dest.startsWith("/") ? dest : `/${dest}`}`;
  }

  const res = NextResponse.redirect(dest);
  res.cookies.set("vendl_campaign", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}
