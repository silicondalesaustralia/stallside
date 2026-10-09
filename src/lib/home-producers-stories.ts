import { featuredStands, type FeaturedStand } from "@/lib/featured-stands";
import { testimonials, type Testimonial } from "@/lib/testimonials";

const FLETCHERS_SHORT =
  "We've already made some great upgrades in a short time, and the team has made it feel like a real partnership.";
const FLETCHERS_LONG = `${FLETCHERS_SHORT} It feels like we're on this journey together, and that support means a lot as our little farm business grows.`;
const MARNIE =
  "It was all so easy and fast to set up - your 10min time set up was generous! I did it all in like 3! ahaha";

/** Returns the testimonial trimmed to a verbatim excerpt, or null if the source no longer contains it. */
function excerpt(id: string, text: string, linkLabel?: string): Testimonial | null {
  const source = testimonials.find((t) => t.id === id);
  if (!source || !source.quote.some((p) => p.includes(text))) return null;
  const link = source.link && linkLabel ? { ...source.link, label: linkLabel } : source.link;
  return { ...source, quote: [text], link };
}

export const fletchersShortExcerpt = excerpt("fletchers-donnybrook", FLETCHERS_SHORT);

export const lpTestimonials = [
  excerpt("fletchers-donnybrook", FLETCHERS_LONG, "Visit their shop"),
  excerpt("marnie-melbourne", MARNIE),
].filter((t): t is Testimonial => t !== null);

function lpStand(id: string): FeaturedStand | null {
  const stand = featuredStands.find((s) => s.id === id);
  if (!stand) return null;
  return {
    ...stand,
    eyebrow: "Producer spotlight",
    description: stand.description.map((p) =>
      p.replace("through their Vendl stand.", "through their Vendl shop."),
    ),
    links: stand.links?.map((l) =>
      l.label === "Visit their stand" ? { ...l, label: "Visit their shop" } : l,
    ),
  };
}

export const lpFletcherbrook = lpStand("fletcherbrook");
