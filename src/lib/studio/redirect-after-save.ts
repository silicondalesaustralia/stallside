import { redirect } from "next/navigation";
import { safeStudioPreviewReturnTo } from "./return-to";

/** Back to the storefront editor when `returnTo` is this shop's editor URL, else to `fallback`. */
export function redirectAfterSave(
  slug: string,
  returnTo: string | undefined,
  query: Record<string, string>,
  fallback: string,
): never {
  const safe = safeStudioPreviewReturnTo(slug, returnTo);
  const url = new URL(safe ?? fallback, "https://vendl.local");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  if (safe) {
    url.searchParams.set("draft", "1");
    url.searchParams.set("edit", "1");
  }
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}
