import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { contactInbox, sendOwnerEmail } from "@/lib/notify-email";

/** Alert platform admin when someone completes signup (first OTP verify). */
export async function notifyAdminNewSignup(input: {
  name: string;
  email: string;
  userId: string;
  ownerId?: string;
  lifetime?: boolean;
}) {
  const name = input.name.trim() || "—";
  const email = input.email.trim().toLowerCase();
  const adminUrl = input.ownerId
    ? `${appBaseUrl()}/admin/owners/${input.ownerId}`
    : `${appBaseUrl()}/admin/owners`;
  const planLine = input.lifetime
    ? "<p><strong>Plan:</strong> Free for Life (Card / Tap &amp; Go)</p>"
    : "<p><strong>Plan:</strong> 30-day trial</p>";

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="font-size:18px;font-weight:600">New user signed up</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${planLine}
      <p style="margin:24px 0">
        <a href="${adminUrl}"
           style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Open in admin
        </a>
      </p>
      <p style="font-size:13px;color:#5a6b5c">User id: ${escapeHtml(input.userId)}</p>
    </div>
  `;

  await sendOwnerEmail(
    contactInbox(),
    `[${APP_NAME}] - New User Sign Up`,
    html,
    { replyTo: email },
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
