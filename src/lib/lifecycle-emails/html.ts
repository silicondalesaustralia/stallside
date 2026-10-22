import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { cleanEnvSecret } from "@/lib/env";
import { appBaseUrl } from "@/lib/app-url";
import { LIFECYCLE_UNSUB_PLACEHOLDER } from "@/lib/lifecycle-emails/unsubscribe";

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

/** Personal inbox so replies reach Jono. */
export const JONO_REPLY_TO = "jono@silicondales.com";

/** "Jono from Vendl" display name on the configured sending address. */
export function jonoFrom(): string {
  const base =
    cleanEnvSecret(process.env.EMAIL_FROM) || `${APP_NAME} <hello@${APP_DOMAIN}>`;
  const address = base.match(/<([^>]+)>/)?.[1] ?? base;
  return `Jono from ${APP_NAME} <${address}>`;
}

export const JONO_SIGNATURE = `<p>Jono<br>Co-founder, ${APP_NAME}</p>`;
export const TEAM_SIGNATURE = `<p>The ${APP_NAME} team</p>`;

export function textLink(href: string, label: string): string {
  return `<a href="${href}" style="color:#2E7D3F">${escapeHtml(label)}</a>`;
}

export function emailShell(
  title: string,
  bodyHtml: string,
  preheader?: string,
): string {
  void title;
  const siteUrl = appBaseUrl();
  const hiddenPreheader = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>`
    : "";
  return `
    ${hiddenPreheader}
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
      ${bodyHtml}
      <p style="font-size:12px;margin:28px 0 0 0">
        <a href="${siteUrl}" style="color:#2E7D3F;text-decoration:none">${siteUrl.replace(/^https?:\/\//, "")}</a>
      </p>
      <p style="font-size:12px;color:#56684F;margin:4px 0 0 0">
        Adelaide Hills, South Australia<br>
        <a href="${LIFECYCLE_UNSUB_PLACEHOLDER}" style="color:#56684F">Unsubscribe</a>
      </p>
    </div>
  `;
}

const CTA_LINK_STYLE =
  "background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block";

function ctaLink(href: string, label: string): string {
  return `<a href="${href}" style="${CTA_LINK_STYLE}">${escapeHtml(label)}</a>`;
}

export function ctaButton(href: string, label: string): string {
  return `
    <p style="margin:24px 0">
      ${ctaLink(href, label)}
    </p>
  `;
}

/** Side-by-side CTAs. Table layout stays inline in most mail clients. */
export function ctaButtonRow(
  buttons: Array<{ href: string; label: string }>,
): string {
  const cells = buttons
    .map(
      (button, i) =>
        `<td style="padding:${i === 0 ? "0 10px 0 0" : "0"}">${ctaLink(button.href, button.label)}</td>`,
    )
    .join("");
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
      <tr>${cells}</tr>
    </table>
  `;
}

export function greetName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? escapeHtml(trimmed) : "there";
}
