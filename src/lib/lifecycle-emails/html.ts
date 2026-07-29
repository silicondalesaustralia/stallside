import { APP_NAME } from "@/lib/constants";
import { cleanEnvSecret } from "@/lib/env";
import { appBaseUrl } from "@/lib/app-url";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function emailReplyTo(): string {
  const configured = cleanEnvSecret(process.env.CONTACT_EMAIL)?.toLowerCase();
  if (configured && !configured.endsWith("@stallside.app")) {
    return configured;
  }
  return `${APP_NAME} <hello@stallside.app>`;
}

export function emailShell(title: string, bodyHtml: string): string {
  const logoUrl = `${appBaseUrl()}/brand/logo-lockup.png`;
  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      <p style="margin:0 0 24px 0">
        <a href="${appBaseUrl()}" style="text-decoration:none">
          <img src="${logoUrl}" alt="${APP_NAME}" width="180"
               style="display:block;width:180px;max-width:60%;height:auto;border:0" />
        </a>
      </p>
      <p style="font-size:18px;font-weight:600">${title}</p>
      ${bodyHtml}
      <p style="font-size:12px;color:#56684F;margin-top:28px">From the ${APP_NAME} team</p>
    </div>
  `;
}

export function ctaButton(href: string, label: string): string {
  return `
    <p style="margin:24px 0">
      <a href="${href}"
         style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

export function greetName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? escapeHtml(trimmed) : "there";
}
