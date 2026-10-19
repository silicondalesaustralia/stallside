import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { registerPushDevice, unregisterPushDevice } from "@/lib/push-devices";

const bodySchema = z.object({
  token: z.string().min(10).max(4096),
  platform: z.enum(["ios", "android", "web"]),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
    });
    if (!owner || owner.deletedAt) {
      return NextResponse.json({ error: "Owner required" }, { status: 403 });
    }

    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await registerPushDevice(owner.id, parsed.data.token, parsed.data.platform);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push register failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
      select: { id: true, deletedAt: true },
    });
    if (!owner || owner.deletedAt) {
      return NextResponse.json({ error: "Owner required" }, { status: 403 });
    }

    const json: unknown = await request.json();
    const token = z.object({ token: z.string().min(10) }).safeParse(json);
    if (!token.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await unregisterPushDevice(owner.id, token.data.token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unregister failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
