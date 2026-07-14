import {
  CampIcon,
  CarParkIcon,
  FarmStallsIcon,
  FirewoodIcon,
  FlowersIcon,
  FridgeIcon,
} from "@/components/UseCaseIcons";

const CASES = [
  {
    title: "Farm stalls",
    subtitle: "Eggs, veg, honey, jam",
    Icon: FarmStallsIcon,
  },
  {
    title: "Firewood & hay",
    subtitle: "Roadside stacks",
    Icon: FirewoodIcon,
  },
  {
    title: "Flowers & plants",
    subtitle: "Driveway buckets",
    Icon: FlowersIcon,
  },
  {
    title: "Camp supplies",
    subtitle: "Ice, wood, milk, gas",
    Icon: CampIcon,
  },
  {
    title: "Honesty car parks",
    subtitle: "Scan the sign, pay the fee",
    Icon: CarParkIcon,
  },
  {
    title: "Community fridges",
    subtitle: "Track what's left",
    Icon: FridgeIcon,
  },
] as const;

export default function UseCaseGrid() {
  return (
    <section id="use-cases" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          What it works for
        </h2>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {CASES.map(({ title, subtitle, Icon }) => (
          <li
            key={title}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-md)] transition-[border-color] duration-150 ease-out hover:border-[var(--leaf)]"
          >
            <Icon />
            <h3 className="mt-2.5 text-sm font-medium text-[var(--ink)]">{title}</h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        If nobody&apos;s standing there, Stallside works.
      </p>
    </section>
  );
}
