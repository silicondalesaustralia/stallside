"use server";

import { revalidatePath } from "next/cache";
import { requireOwner, requireOwnerWrite } from "@/lib/session";
import { updateOwnerBusinessName } from "@/lib/account/service";
import { previewWebAddress, syncWebAddressToName, type WebAddressPreview } from "@/lib/storefront/web-address";
import { storefrontSubdomainHost } from "@/lib/tenancy/public-url";

export async function previewWebAddressAction(name: string): Promise<WebAddressPreview | null> {
  const trimmed = name.trim().slice(0, 120);
  if (trimmed.length < 2) return null;
  try {
    const { owner } = await requireOwner();
    return await previewWebAddress(owner.id, trimmed);
  } catch (error) {
    console.error("Web address preview failed", error);
    return null;
  }
}

export async function updateBusinessNameAndAddress(
  formData: FormData,
): Promise<{ error: string } | { ok: true; host: string | null }> {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("businessName") ?? "");
  const saved = await updateOwnerBusinessName(owner.id, name);
  if ("error" in saved) return { error: saved.error };
  if (formData.get("renameAddress") !== "on") return { ok: true, host: null };
  try {
    const renamed = await syncWebAddressToName(owner.id, name);
    if ("error" in renamed) return { error: `Business name saved. ${renamed.error}` };
    revalidatePath("/dashboard/website", "layout");
    revalidatePath("/dashboard/get-started");
    return { ok: true, host: storefrontSubdomainHost(renamed.slug) };
  } catch (error) {
    console.error("Web address rename failed", error);
    return { error: "Business name saved, but the web address couldn't be changed. Try again." };
  }
}
