import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  token: z.string().min(10).max(4096),
  platform: z.enum(["ios", "android", "web"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
    });
    if (!owner) {
      return NextResponse.json({ error: "Owner required" }, { status: 403 });
    }

    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await prisma.pushDevice.upsert({
      where: { token: parsed.data.token },
      create: {
        ownerId: owner.id,
        token: parsed.data.token,
        platform: parsed.data.platform,
      },
      update: {
        ownerId: owner.id,
        platform: parsed.data.platform,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push register failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json: unknown = await request.json();
    const token = z.object({ token: z.string().min(10) }).safeParse(json);
    if (!token.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await prisma.pushDevice.deleteMany({ where: { token: token.data.token } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unregister failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
