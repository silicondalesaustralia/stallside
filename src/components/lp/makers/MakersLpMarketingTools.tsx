import MakersLpEmailShot from "@/components/lp/makers/MakersLpEmailShot";
import MakersLpVideoClipShot from "@/components/lp/makers/MakersLpVideoClipShot";
import MakersLpWeekPlanShot from "@/components/lp/makers/MakersLpWeekPlanShot";
import { HOME_H3 } from "@/components/lp/makers/makers-lp-styles";

const TOOLS = [
  {
    title: "Plan a week of posts in one go",
    body: "Build My Week drafts several posts at once. Review the designs, then add them all to your calendar.",
    shot: <MakersLpWeekPlanShot />,
  },
  {
    title: "Turn one video into short clips",
    body: "Upload a longer video and get short vertical clips with captions, ready for Reels and TikTok.",
    shot: <MakersLpVideoClipShot />,
  },
  {
    title: "Email the right customers",
    body: "Send a campaign to a saved list, like everyone who bought soap lately, or email one customer.",
    shot: <MakersLpEmailShot />,
  },
] as const;

export default function MakersLpMarketingTools() {
  return (
    <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {TOOLS.map((tool) => (
        <article key={tool.title} className="flex flex-col">
          <h3 className={`${HOME_H3} mb-2 text-xl`}>{tool.title}</h3>
          <p className="mb-5 text-sm text-[var(--muted)]">{tool.body}</p>
          <div className="mt-auto">{tool.shot}</div>
        </article>
      ))}
    </div>
  );
}
