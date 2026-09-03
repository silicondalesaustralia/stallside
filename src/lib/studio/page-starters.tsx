import { Element } from "@craftjs/core";
import type { ReactNode } from "react";
import type { CustomPageTemplateId } from "./custom-pages";
import type { StudioTemplateId } from "./types";
import StudioPageRoot from "@/components/studio/sections/StudioPageRoot";
import CraftHeroSection from "@/components/craft/sections/CraftHeroSection";
import CraftTextSection from "@/components/studio/sections/CraftTextSection";
import CraftAboutSection from "@/components/craft/sections/CraftAboutSection";
import CraftImageTextSection from "@/components/studio/sections/CraftImageTextSection";
import CraftPickupSection from "@/components/studio/sections/CraftPickupSection";
import CraftSignupSection from "@/components/studio/sections/CraftSignupSection";

function minimalHero(title: string, subtitle: string) {
  return (
    <CraftHeroSection
      headline={title}
      supportingText={subtitle}
      layout="minimal"
      ctaLabel=""
      showCta={false}
    />
  );
}

import { POLICY_EDITING_DISCLAIMER, POLICY_STATIC_FALLBACK } from "./policy-content";

function policyDisclaimerSection() {
  return (
    <CraftTextSection
      heading="Note for sellers"
      body={POLICY_EDITING_DISCLAIMER}
      alignment="left"
    />
  );
}

export function buildCustomPageStarterTree(input: {
  template: CustomPageTemplateId;
  templateId: StudioTemplateId;
  title: string;
  headline: string;
  about: string | null;
}) {
  const subtitle = input.about ?? "";
  const sections: ReactNode[] = [];

  switch (input.template) {
    case "blank":
      sections.push(
        <CraftTextSection
          heading={input.title}
          body="Add your content using sections from the panel."
          alignment="left"
        />,
      );
      break;
    case "about":
      sections.push(minimalHero(input.title, subtitle));
      sections.push(
        <CraftImageTextSection
          imageUrl=""
          heading="Our story"
          body={subtitle || "Tell customers who you are, what you make, and why it matters."}
          layout="image-left"
          ctaLabel=""
        />,
      );
      sections.push(
        <CraftAboutSection
          heading="About us"
          body={subtitle || "Share more about your business here."}
          layout="simple"
        />,
      );
      break;
    case "contact":
      sections.push(minimalHero(input.title, "We'd love to hear from you."));
      sections.push(
        <CraftTextSection
          heading="Get in touch"
          body="Whether it's about an order, pickup times, or our products — send us a message and we'll get back to you."
          alignment="left"
        />,
      );
      break;
    case "faq":
      sections.push(minimalHero(input.title, "Quick answers to common questions"));
      sections.push(
        <CraftTextSection
          heading="Ordering"
          body="How do I place an order?\nAdd products to your cart and checkout online. You'll receive confirmation by email."
          alignment="left"
        />,
      );
      sections.push(
        <CraftTextSection
          heading="Pickup & delivery"
          body="When and where can I collect?\nCheck the pickup section on our homepage or contact us for details."
          alignment="left"
        />,
      );
      break;
    case "wholesale":
      sections.push(minimalHero(input.title, "Trade and wholesale enquiries welcome"));
      sections.push(
        <CraftTextSection
          heading="Wholesale"
          body="We supply cafes, retailers and markets. Tell us about your business and what you're looking for."
          alignment="left"
        />,
      );
      sections.push(
        <CraftSignupSection
          heading="Enquire about wholesale"
          body="Leave your email and we'll be in touch."
          buttonLabel="Send enquiry"
        />,
      );
      break;
    case "stockists":
      sections.push(minimalHero(input.title, "Find us locally"));
      sections.push(
        <CraftTextSection
          heading="Stockists"
          body="List the shops, markets and venues where customers can find your products."
          alignment="left"
        />,
      );
      break;
    case "pickup-delivery":
      sections.push(minimalHero(input.title, "How to get your order"));
      sections.push(
        <CraftPickupSection preset="cards" heading="Pickup & delivery options" />,
      );
      sections.push(
        <CraftTextSection
          heading="Need help?"
          body="Contact us if you have questions about pickup times or delivery areas."
          alignment="left"
        />,
      );
      break;
    case "info":
      sections.push(minimalHero(input.title, subtitle));
      sections.push(
        <CraftTextSection
          heading="Information"
          body="Use this page for policies, opening hours, allergen information, or anything else your customers need to know."
          alignment="left"
        />,
      );
      break;
    case "privacy": {
      const fb = POLICY_STATIC_FALLBACK.privacy;
      sections.push(minimalHero(fb.title, "How we handle your information"));
      sections.push(policyDisclaimerSection());
      for (const s of fb.sections) {
        sections.push(
          <CraftTextSection key={s.heading} heading={s.heading} body={s.body} alignment="left" />,
        );
      }
      break;
    }
    case "terms": {
      const fb = POLICY_STATIC_FALLBACK.terms;
      sections.push(minimalHero(fb.title, "Terms for using our shop"));
      sections.push(policyDisclaimerSection());
      for (const s of fb.sections) {
        sections.push(
          <CraftTextSection key={s.heading} heading={s.heading} body={s.body} alignment="left" />,
        );
      }
      break;
    }
    case "returns": {
      const fb = POLICY_STATIC_FALLBACK.returns;
      sections.push(minimalHero(fb.title, "Our returns and refund approach"));
      sections.push(policyDisclaimerSection());
      for (const s of fb.sections) {
        sections.push(
          <CraftTextSection key={s.heading} heading={s.heading} body={s.body} alignment="left" />,
        );
      }
      break;
    }
    case "shipping-pickup": {
      const fb = POLICY_STATIC_FALLBACK.shipping;
      sections.push(minimalHero(fb.title, "How you get your order"));
      sections.push(policyDisclaimerSection());
      sections.push(
        <CraftPickupSection preset="cards" heading="Pickup & delivery options" />,
      );
      for (const s of fb.sections) {
        sections.push(
          <CraftTextSection key={s.heading} heading={s.heading} body={s.body} alignment="left" />,
        );
      }
      break;
    }
    case "blog-index":
      sections.push(minimalHero(input.title, "News, recipes, and updates from our kitchen"));
      sections.push(
        <CraftTextSection
          heading="Latest posts"
          body="Your published articles appear below this section automatically."
          alignment="left"
        />,
      );
      break;
    default:
      sections.push(
        <CraftTextSection heading={input.title} body="" alignment="left" />,
      );
  }

  return (
    <Element is={StudioPageRoot} canvas>
      {sections}
    </Element>
  );
}
