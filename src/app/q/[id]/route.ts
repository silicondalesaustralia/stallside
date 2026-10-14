import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/app-url";
import { resolveQrTarget } from "@/lib/qr-short-link";

/** QR short link: always a temporary redirect, since the destination can change. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const target = await resolveQrTarget(decodeURIComponent(id));
    if (target) return NextResponse.redirect(target, 307);
  } catch (err) {
    console.error("[qr-short-link] resolve failed", id, err);
  }
  return NextResponse.redirect(appBaseUrl(), 307);
}
