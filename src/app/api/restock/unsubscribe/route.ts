import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubStatus } from "@/generated/prisma/client";

/** RFC 8058 one-click List-Unsubscribe POST. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token || token.length > 128) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const sub = await prisma.restockSubscriber.findUnique({
    where: { unsubToken: token },
    select: { id: true, status: true },
  });
  if (!sub) {
    return NextResponse.json({ error: "invalid" }, { status: 404 });
  }
  if (sub.status !== SubStatus.UNSUBSCRIBED) {
    await prisma.restockSubscriber.update({
      where: { id: sub.id },
      data: {
        status: SubStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
