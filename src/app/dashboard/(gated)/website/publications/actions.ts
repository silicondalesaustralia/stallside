"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { restorePublicationAsDraft } from "@/lib/website/persistence/publish";
import { webStudioPath } from "@/lib/website/web-studio-nav";

export async function restorePublicationAction(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const publicationId = String(formData.get("publicationId") ?? "").trim();
  if (!publicationId) redirect(webStudioPath("details", { error: "restore" }));

  const result = await restorePublicationAsDraft(owner.id, publicationId);
  if (!result.ok) {
    redirect(webStudioPath("details", { error: result.reason === "conflict" ? "conflict" : "restore" }));
  }

  revalidatePath("/dashboard/website", "layout");
  redirect(webStudioPath("details", { restored: "1" }));
}
