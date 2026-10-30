import { APP_NAME } from "@/lib/constants";

const CALLOUT_STYLE =
  "margin:24px 0 16px 0;padding:14px 16px;background:#F1F6EE;border-radius:12px";

/** Short invite placed just before the sign-off of sequence emails. */
export const SKOOL_COMMUNITY_LINE = `
  <p style="${CALLOUT_STYLE}">🌱 <strong>Join the ${APP_NAME} community on Skool</strong> -
  everything you need to grow your home producer business.
  <strong>Reply to this email</strong> and we'll send your invite.</p>
`;

const PERKS = [
  `Early access to new ${APP_NAME} features.`,
  "A say in what we build - request what <strong>your</strong> business needs.",
  "Marketing lessons and guides covering email, social, paid ads, SEO and visibility in AI answers.",
  "Help understanding costs, pricing and profit.",
  "A place to ask us questions and meet other makers.",
];

/** Full community pitch for the signup welcome email. */
export function skoolWelcomeSection(): string {
  const perks = PERKS.map((perk) => `✅ ${perk}`).join("<br>");
  return `
    <p><strong>🌱 Join our ${APP_NAME} community on Skool</strong></p>
    <p>You make the products. Let's help you build the business.</p>
    <p>It's for bakers, growers, makers and producers - working from home, a
    commercial kitchen or a workshop. We've worked in ecommerce, software and online
    marketing for over 20 years, and we're home producers too.</p>
    <p>Inside, you'll get:</p>
    <p>${perks}</p>
    <p>Keep your existing website or build one with ${APP_NAME}. You don't need to
    start over.</p>
    <p>🎁 Free group access for every beta tester, plus 30% off ${APP_NAME} Pro for
    life when we launch.</p>
    <p><strong>Reply to this email with "I'm in"</strong> and we'll send your invite.
    Bring your ideas, questions and honest feedback, and help shape what comes next.</p>
  `;
}
