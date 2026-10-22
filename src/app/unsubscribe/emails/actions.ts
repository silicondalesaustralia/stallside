"use server";

import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import {
  optOutLifecycleEmails,
  verifyLifecycleUnsub,
} from "@/lib/lifecycle-emails/unsubscribe";

export async function unsubscribeLifecycleEmails(formData: FormData) {
  const token = String(formData.get("t") ?? "");
  const email = verifyLifecycleUnsub(token);
  let status = "invalid";
  if (email) {
    try {
      await optOutLifecycleEmails(email);
      status = "done";
    } catch (error) {
      console.error(`[${APP_NAME}] lifecycle unsubscribe failed`, error);
      status = "error";
    }
  }
  redirect(`/unsubscribe/emails?t=${encodeURIComponent(token)}&s=${status}`);
}
