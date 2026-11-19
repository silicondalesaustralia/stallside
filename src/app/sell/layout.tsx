import { DM_Serif_Display } from "next/font/google";
import "./sell.css";
import "./sell-chrome.css";

const sellSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sell-serif",
  display: "swap",
});

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`sell-shell ${sellSerif.variable}`}
      style={
        {
          "--font-sell-sans": "var(--font-body)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
