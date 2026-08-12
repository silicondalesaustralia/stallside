import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SELECTED_BUSINESS_COOKIE = "vendl_selected_business";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function secureCookies(): boolean {
  return (process.env.AUTH_URL ?? "").startsWith("https://");
}

export type BusinessOption = {
  id: string;
  name: string;
  slug: string;
};

export async function readSelectedBusinessCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(SELECTED_BUSINESS_COOKIE)?.value?.trim();
  return value || null;
}

export async function writeSelectedBusinessCookie(standId: string) {
  const jar = await cookies();
  jar.set(SELECTED_BUSINESS_COOKIE, standId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookies(),
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Stands for owner + resolved selection (cookie, else first by name). */
export const resolveSelectedBusiness = cache(async (
  ownerId: string,
): Promise<{
  businesses: BusinessOption[];
  selected: BusinessOption | null;
}> => {
  const businesses = await prisma.stand.findMany({
    where: { ownerId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  if (businesses.length === 0) {
    return { businesses, selected: null };
  }
  const cookieId = await readSelectedBusinessCookie();
  const selected =
    businesses.find((b) => b.id === cookieId) ?? businesses[0] ?? null;
  return { businesses, selected };
});
