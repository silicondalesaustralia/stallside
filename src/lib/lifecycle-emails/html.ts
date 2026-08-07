import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
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
  if (
    configured &&
    !configured.endsWith(`@${APP_DOMAIN}`) &&
    !configured.endsWith("@stallside.app")
  ) {
    return configured;
  }
  return `${APP_NAME} <hello@${APP_DOMAIN}>`;
}

export function emailShell(title: string, bodyHtml: string): string {
  void title;
  const siteUrl = appBaseUrl();
  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      ${bodyHtml}
      <p style="font-size:12px;color:#56684F;margin-top:28px;margin-bottom:0">
        From the ${APP_NAME} team
      </p>
      <p style="font-size:12px;margin:4px 0 0 0">
        <a href="${siteUrl}" style="color:#2E7D3F;text-decoration:none">${siteUrl.replace(/^https?:\/\//, "")}</a>
      </p>
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
