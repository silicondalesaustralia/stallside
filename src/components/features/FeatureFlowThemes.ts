import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CreditCard,
  Package,
  Share2,
  Sparkles,
} from "lucide-react";

export type FlowStepTheme = {
  Icon: LucideIcon;
  accent: string;
  soft: string;
  ring: string;
};

/** Rotating step look — brand greens, marigold, field. */
export const FLOW_STEP_THEMES: FlowStepTheme[] = [
  {
    Icon: Package,
    accent: "#2e7d3f",
    soft: "#e7f3ea",
    ring: "#b7d9bf",
  },
  {
    Icon: Share2,
    accent: "#c77400",
    soft: "#fff1de",
    ring: "#f0c98a",
  },
  {
    Icon: Sparkles,
    accent: "#1e5a2c",
    soft: "#e4eee6",
    ring: "#a8c4b0",
  },
  {
    Icon: CreditCard,
    accent: "#3d6b5a",
    soft: "#e5f0eb",
    ring: "#a9c9bb",
  },
  {
    Icon: CheckCircle2,
    accent: "#17361f",
    soft: "#eef2ea",
    ring: "#c5d4c2",
  },
];

/** Desktop zigzag — not a straight row. */
export const FLOW_DESKTOP_POS: Array<{ top: string; left: string; rotate: string }> = [
  { top: "4%", left: "0%", rotate: "-2.5deg" },
  { top: "48%", left: "18%", rotate: "2deg" },
  { top: "2%", left: "38%", rotate: "-1.5deg" },
  { top: "50%", left: "58%", rotate: "2.5deg" },
  { top: "8%", left: "78%", rotate: "-2deg" },
];
