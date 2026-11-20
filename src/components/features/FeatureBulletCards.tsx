import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_WRAP } from "@/components/home/home-styles";
import { featureBulletIcons } from "@/lib/features/icons";

export default function FeatureBulletCards({
  slug,
  bullets,
}: {
  slug: string;
  bullets: string[];
}) {
  const icons = featureBulletIcons(slug, bullets.length);

  return (
    <section className={`${HOME_WRAP} border-t border-[var(--line)] py-16 md:py-[88px]`}>
      <p className={HOME_EYEBROW}>WHAT YOU GET</p>
      <h2 className={HOME_H2}>Built for how you already sell.</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {bullets.map((item, index) => {
          const Icon = icons[index];
          return (
            <li
              key={item}
              className="flex gap-4 rounded-xl border border-[var(--line)] bg-white p-4 shadow-[0_4px_16px_#17361f08]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--wash)] text-[var(--leaf)]">
                <Icon aria-hidden className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className={`${HOME_H3} text-base leading-snug`}>{item}</h3>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
