"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminBlogPath } from "@/lib/blog/paths";
import { pickBlogTopic } from "@/lib/blog/pick-topic";

export async function createManualTopicAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const angle = String(formData.get("angle") ?? "").trim().slice(0, 1000);
  const section = formData.get("section") === "NEWS" ? "NEWS" : "GUIDE";
  if (title.length < 5) redirect(`${adminBlogPath("topics")}&error=${encodeURIComponent("Topic title is too short")}`);
  await prisma.blogTopic.create({
    data: { title, angle: angle || null, section, source: "MANUAL", score: 80 },
  });
  redirect(adminBlogPath("topics"));
}

export async function writeTopicNowAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing topic id");
  const result = await pickBlogTopic(id);
  const query = result.ok ? "" : `&error=${encodeURIComponent(result.reason)}`;
  redirect(`${adminBlogPath("topics")}${query}`);
}

export async function setTopicStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "REJECTED" ? "REJECTED" : "IDEA";
  if (!id) throw new Error("Missing topic id");
  await prisma.blogTopic.update({ where: { id }, data: { status } });
  redirect(adminBlogPath("topics"));
}
