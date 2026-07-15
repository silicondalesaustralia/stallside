"use server";

import { contactInbox, sendOwnerEmail } from "@/lib/notify-email";
import { isContactSubject } from "@/lib/contact-subjects";

export type ContactState = {
  ok: boolean;
  error?: string;
};

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const honeypot = asTrimmedString(formData.get("company"));
  if (honeypot) {
    return { ok: true };
  }

  const name = asTrimmedString(formData.get("name"));
  const email = asTrimmedString(formData.get("email"));
  const subjectRaw = asTrimmedString(formData.get("subject"));
  const message = asTrimmedString(formData.get("message"));

  if (!name || name.length > 120) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!isContactSubject(subjectRaw)) {
    return { ok: false, error: "Please choose a subject." };
  }
  if (!message || message.length < 10 || message.length > 5000) {
    return { ok: false, error: "Please enter a message (at least 10 characters)." };
  }

  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(subjectRaw)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    await sendOwnerEmail(
      contactInbox(),
      `[Stallside contact] ${subjectRaw}`,
      html,
      { replyTo: email },
    );
    return { ok: true };
  } catch (error) {
    console.error("Contact form email failed", error);
    return {
      ok: false,
      error: "Could not send your message. Please try again or email us directly.",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
