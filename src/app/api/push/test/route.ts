import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOwnerPush } from "@/lib/notify-push";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: "Owner required" }, { status: 403 });
    }

    await sendOwnerPush(owner.id, {
      title: "Vendl.app",
      body: "Phone alerts are on. You'll get a ping when something sells.",
      data: { type: "test" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push test failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
