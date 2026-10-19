"use server";

import { redirect } from "next/navigation";
import { blogPickPath } from "@/lib/blog/paths";
import { verifyPickToken } from "@/lib/blog/pick-token";
import { pickBlogTopic } from "@/lib/blog/pick-topic";

/** POST from the confirm page (email scanners only GET, so they can't trigger a write). */
export async function confirmBlogPickAction(formData: FormData) {
  const token = String(formData.get("t") ?? "");
  const verified = verifyPickToken(token);
  if (!verified) redirect(`${blogPickPath(token)}&error=${encodeURIComponent("This link has expired.")}`);

  const result = await pickBlogTopic(verified.topicId);
  const query = result.ok ? "&done=1" : `&error=${encodeURIComponent(result.reason)}`;
  redirect(`${blogPickPath(token)}${query}`);
}
