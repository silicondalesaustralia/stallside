import { BellRing, CalendarClock, Clapperboard, ListFilter, Mail, Sparkles, type LucideIcon } from "lucide-react";

export type HomeMarketingPoint = { icon: LucideIcon; text: string };

const SOCIAL_POINTS: HomeMarketingPoint[] = [
  { icon: Sparkles, text: "Turn a product photo into a branded post for Instagram, Facebook and Google Business." },
  { icon: CalendarClock, text: "Post now, schedule it, or plan a whole week of posts at once and see them on your calendar." },
  { icon: Clapperboard, text: "Turn one longer video into short vertical clips with captions." },
];

const EMAIL_POINTS: HomeMarketingPoint[] = [
  { icon: Mail, text: "Send branded email campaigns to saved lists, or email one customer at a time." },
  { icon: ListFilter, text: "Build lists from what people bought, like everyone who bought soap in the last 90 days." },
  { icon: BellRing, text: "Restock alerts go out automatically to customers who asked to hear when it’s back." },
];

export function homeMarketingPoints(showSocial: boolean): HomeMarketingPoint[] {
  return showSocial ? [...SOCIAL_POINTS, ...EMAIL_POINTS] : EMAIL_POINTS;
}
