import { APP_NAME } from "@/lib/constants";

export async function sendOwnerEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n[${APP_NAME} notify email] ${to}\n${subject}\n${html}\n`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <hello@stallside.app>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[${APP_NAME}] notify email failed`, { to, subject, detail });
    throw new Error(`Email failed: ${detail}`);
  }
}
