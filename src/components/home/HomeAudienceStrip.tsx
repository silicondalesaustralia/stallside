import { Fragment } from "react";
import { HOME_AUDIENCE } from "@/lib/home-page-copy";

export default function HomeAudienceStrip() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 border-y border-[var(--line)] px-[22px] py-5 text-[11px] font-semibold text-[var(--field)] sm:justify-center sm:gap-x-9 sm:px-8 sm:py-6 sm:text-[13px]">
      {HOME_AUDIENCE.map((label, i) => (
        <Fragment key={label}>
          {i > 0 ? (
            <i aria-hidden className="hidden text-[21px] not-italic text-[#c38a27] lg:inline">
              ✳
            </i>
          ) : null}
          <span>{label}</span>
        </Fragment>
      ))}
    </div>
  );
}
