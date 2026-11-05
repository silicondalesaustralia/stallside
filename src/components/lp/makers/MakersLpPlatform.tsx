import MarketingDashboardShot from "@/components/MarketingDashboardShot";
import MakersLpCalendarShot from "@/components/lp/makers/MakersLpCalendarShot";
import MakersLpEditorShot from "@/components/lp/makers/MakersLpEditorShot";
import MakersLpPlatformTabs from "@/components/lp/makers/MakersLpPlatformTabs";
import MakersLpProductEditorShot from "@/components/lp/makers/MakersLpProductEditorShot";
import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

export default function MakersLpPlatform({ showSocial }: { showSocial: boolean }) {
  return (
    <section id="platform" className={`${HOME_WRAP} scroll-mt-6 py-16 md:py-[100px]`}>
      <div className="mb-7 items-end gap-16 md:mb-10 md:flex lg:gap-28">
        <div>
          <p className={HOME_EYEBROW}>YOUR BUSINESS, ALL TOGETHER</p>
          <h2 className={HOME_H2}>See Vendl in Action</h2>
        </div>
        <p className="mt-5 border-l-2 border-[var(--leaf)] pl-5 text-[15px] leading-relaxed text-[var(--muted)] md:mt-0 md:text-[17px]">
          Illustrative previews of Vendl: a maker’s website, the business dashboard with products, stock and orders, and
          the calendar. Below, try the production costing and pricing tools yourself.
        </p>
      </div>
      <MakersLpPlatformTabs
        previews={[
          <div key="website" className="relative sm:pb-28 lg:pb-32">
            <MakersLpEditorShot />
            <MakersLpProductEditorShot />
          </div>,
          <div key="orders" className="relative max-h-[940px] overflow-hidden rounded-2xl [zoom:0.5] sm:[zoom:0.62]">
            <MarketingDashboardShot />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#edf0e7] to-transparent" />
          </div>,
          <MakersLpCalendarShot key="calendar" showSocial={showSocial} />,
        ]}
      />
    </section>
  );
}
