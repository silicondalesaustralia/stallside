import { APP_NAME } from "@/lib/constants";

export async function sendOwnerEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Email failed: ${await res.text()}`);
    }
    return;
  }
  console.log(`\n[${APP_NAME} notify email] ${to}\n${subject}\n${html}\n`);
}
