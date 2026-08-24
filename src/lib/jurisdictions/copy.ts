import type { JurisdictionRecord } from "./types";

/** First-sentence answer blocks, keep declarative, entity in sentence. */
export function answerLead(record: JurisdictionRecord): string {
  if (record.country === "US") {
    switch (record.code) {
      case "fl":
        return "In Florida, a cottage food operation is exempt from food permitting under section 500.80 if it stays within the cottage food rules and annual gross sales of cottage food products do not exceed US$250,000.";
      case "mi":
        return "In Michigan, a cottage food operation can sell certain non-potentially hazardous foods from a home kitchen without an MDARD licence if annual gross sales stay within the statutory cap (US$50,000, or US$75,000 when units sell for US$250 or more).";
      case "oh":
        return "In Ohio, a cottage food production operation may sell listed non-potentially hazardous foods from a home kitchen without an Ohio Department of Agriculture licence. A separate home bakery licence covers potentially hazardous bakery items.";
      case "sc":
        return "In South Carolina, the Home-based Food Production Law lets you sell listed non-potentially hazardous foods from a home kitchen without a retail food establishment permit, if you follow labelling and sales rules under section 44-1-143.";
      case "mo":
        return "In Missouri, a cottage food production operation under RSMo 196.298 can sell a narrow list of home-kitchen foods directly to consumers without a food permit or routine health inspection. The statute is not a general homemade-food law.";
      case "ca":
        return "In California, a cottage food operation must register (Class A) or get a permit (Class B) from the local environmental health agency, stay on the approved foods list, and keep gross annual sales within the Class A or Class B cap.";
      default:
        return `Cottage food rules in ${record.name} are set by ${record.gate.regulator_primary} under ${record.law.statute}.`;
    }
  }

  switch (record.code) {
    case "sa":
      return "In South Australia, you must notify the relevant enforcement agency before you start operating a home-based food business. For most people, that means notifying your local council. There is no fee for the Food Business Notification itself, but failing to notify carries a maximum penalty of A$25,000 for an individual.";
    case "nsw":
      return "In New South Wales, if you sell food you make at home direct to the person who eats it, you must notify your local council. Selling to a business to on-sell is handled by the NSW Food Authority instead.";
    case "vic":
      return "In Victoria you must register with or notify your local council before you run a home-based food business. Your class under the Food Act 1984 decides which path applies.";
    case "qld":
      return "In Queensland you need a food business licence from your local council only if your activity is a licensable food business under the Food Act 2006. Many low-risk farm-gate activities are licence-exempt but still must follow the Food Standards Code.";
    case "wa":
      return "In Western Australia, food prepared in a residential home for sale is a food business under the Food Act 2008. You must register or notify with your local government Environmental Health Services before you operate.";
    case "tas":
      return "In Tasmania, your local council Environmental Health Officer classifies your food business under the Food Business Risk Classification System. Higher-risk classes register annually; lower-risk classes notify.";
    case "act":
      return "In the Australian Capital Territory, most food businesses must register with the ACT Health Protection Service before opening. Access Canberra is the front door for the application. There is no local-council food-registration pathway. Domestic home kitchens are only approved for low-risk food preparation.";
    case "nt":
      return "In the Northern Territory, food businesses must register with NT Health before operating. Fees and registration length follow the Priority 1 to Priority 4 risk classification.";
    default:
      return `Rules for a home-based food business in ${record.name} depend on your local council and the ${record.law.statute}.`;
  }
}

export function pageTitle(record: JurisdictionRecord): string {
  if (record.country === "US") {
    return `${record.name} cottage food law`;
  }
  return `Selling food from home in ${record.name}`;
}

export function pageDescription(record: JurisdictionRecord): string {
  if (record.country === "US") {
    if (record.code === "mo") {
      return "Missouri cottage food law: RSMo 196.298 products, in-state internet sales, labelling, and how local health rules apply outside the cottage food path.";
    }
    return `${record.name} cottage food law: sales caps, approved foods, labelling, and who regulates home kitchen sales.`;
  }
  if (record.code === "sa") {
    return "Selling food from home in South Australia: Food Business Notification, farm-gate rules, eggs, labelling, and where you can sell.";
  }
  if (record.code === "act") {
    return "Selling food from home in the ACT: Health Protection Service registration, home-kitchen limits, exemptions, fees, labelling, and Access Canberra.";
  }
  return `How to start a home-based food business in ${record.name}: who regulates you, how to notify or apply, labelling, and where you can sell, including farm gate and stalls.`;
}
