import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { BellRing, Boxes, Printer, QrCode, Smartphone, type LucideIcon } from "lucide-react";
import MakersLpStandPoster from "@/components/lp/makers/MakersLpStandPoster";
import { HOME_BUTTON, HOME_EYEBROW, HOME_H2, HOME_PLAN_TAG, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { websiteDemoStandSlug } from "@/lib/demo/green-valley/constants";
import { standCheckoutUrl } from "@/lib/stand-qr";

const POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: QrCode, text: "One QR code for your honesty box, market table, roadside stand or shop counter." },
  { icon: Smartphone, text: "Customers scan, choose and pay on their own phone. No card reader or cash tin needed." },
  { icon: Printer, text: "Print a ready-made poster with your business name and the ways people can pay." },
  { icon: BellRing, text: "Get a sale alert the moment someone pays, even when you’re not there." },
  { icon: Boxes, text: "Stock counts update as you sell, at the stand and online." },
];

async function demoQrSrc(url: string): Promise<string | null> {
  try {
    const svg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#1a2e1a", light: "#ffffff" } });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } catch (error) {
    console.error("Home stand QR failed", error);
    return null;
  }
}

export default async function MakersLpStands() {
  const standUrl = standCheckoutUrl(websiteDemoStandSlug());
  const qrSrc = await demoQrSrc(standUrl);

  return (
    <section id="stands" className={`${HOME_WRAP} scroll-mt-6 grid items-center gap-14 py-16 md:grid-cols-2 md:gap-20 md:py-[100px]`}>
      <div className="relative mr-6 sm:mr-10">
        <Image
          src="/lp/green-valley-eggs-stallside-stand.jpg"
          alt="A roadside honesty stand with eggs and honey and a QR code poster"
          width={819}
          height={1024}
          sizes="(max-width: 768px) 100vw, 520px"
          className="h-[420px] w-full rounded-[6px_70px_6px_6px] object-cover md:h-[520px] md:rounded-[7px_100px_7px_7px]"
        />
        <MakersLpStandPoster qrSrc={qrSrc} />
      </div>
      <div>
        <p className={HOME_EYEBROW}>FARM STANDS, MARKETS &amp; STALLS</p>
        <span className={HOME_PLAN_TAG}>FREE &amp; PRO</span>
        <h2 className={`${HOME_H2} mb-6 mt-4`}>
          Sell at the gate.
          <br />
          Get paid on their phone.
        </h2>
        <p className="mb-6 text-base text-[var(--muted)]">
          Built for the farm gate as much as the web. Put a QR code on your stand or market table and let customers buy
          without you standing there.
        </p>
        <ul className="mb-8 space-y-3.5 text-sm text-[var(--field)]">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0 text-[var(--leaf)]" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <Link href="/signup" className={HOME_BUTTON}>
          Start free <span aria-hidden>↗</span>
        </Link>
      </div>
    </section>
  );
}
