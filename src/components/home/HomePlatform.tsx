import MarketingDashboardShot from "@/components/MarketingDashboardShot";
import HomeCalendarShot from "@/components/home/HomeCalendarShot";
import HomeEditorShot from "@/components/home/HomeEditorShot";
import HomePlatformTabs from "@/components/home/HomePlatformTabs";
import HomeProductEditorShot from "@/components/home/HomeProductEditorShot";
import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/home/home-styles";

export default function HomePlatform({ showSocial }: { showSocial: boolean }) {
  return (
    <section id="platform" className={`${HOME_WRAP} scroll-mt-6 py-16 md:py-[100px]`}>
      <div className="mb-7 items-end gap-16 md:mb-10 md:flex lg:gap-28">
        <div>
          <p className={HOME_EYEBROW}>YOUR BUSINESS, ALL TOGETHER</p>
          <h2 className={HOME_H2}>
            From the workbench
            <br />
            to the checkout.
          </h2>
        </div>
        <p className="mt-5 border-l-2 border-[var(--leaf)] pl-5 text-[15px] leading-relaxed text-[var(--muted)] md:mt-0 md:text-[19px] lg:text-[21px]">
          Make something worth buying.
          <br />
          Give it a place to sell.
          <br />
          Keep the details under control.
        </p>
      </div>
      <HomePlatformTabs
        previews={[
          <div key="website" className="relative sm:pb-28 lg:pb-32">
            <HomeEditorShot />
            <HomeProductEditorShot />
          </div>,
          <div key="orders" className="relative max-h-[940px] overflow-hidden rounded-2xl [zoom:0.5] sm:[zoom:0.62]">
            <MarketingDashboardShot />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#edf0e7] to-transparent" />
          </div>,
          <HomeCalendarShot key="calendar" showSocial={showSocial} />,
        ]}
      />
    </section>
  );
}
