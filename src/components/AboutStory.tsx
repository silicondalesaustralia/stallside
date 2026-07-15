import Link from "next/link";

/** Origin story for /about. Keep claims aligned with live vs coming-soon features. */
export default function AboutStory() {
  return (
    <div className="space-y-10 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
      <section className="space-y-5">
        <p>
          Stallside began about 500 metres from our front door.
        </p>
        <p>
          My daughter is ten. She keeps hens, and like a lot of kids in rural Australia, she
          set up a little stall at the road to sell the eggs: a table, a handwritten sign, a
          cash tin, and the honesty of whoever happened to be driving past. It worked the way
          these stalls have always worked. You leave the eggs out, people take them, people
          pay. Most of the country runs on exactly this kind of quiet trust.
        </p>
        <p>
          But two things kept going wrong, and they&apos;re the reason this exists.
        </p>
        <p>
          We kept losing sales without knowing. She&apos;d sell out by mid-morning and we&apos;d
          have no idea until we walked down to refill and found an empty table. That meant
          hours of an empty stall, a sign still promising eggs that weren&apos;t there, and
          customers who&apos;d driven up for nothing. Other times we&apos;d wonder if anything
          had sold at all. From the house, we were guessing.
        </p>
        <p>
          And people wanted to pay, but couldn&apos;t. More than once someone would mention
          they&apos;d wished there was another way. They had no cash on them, nobody carries
          coins anymore, and they&apos;d wanted the eggs but driven off without them. A sale
          lost, not because anyone was dishonest, but because a tin only takes one kind of money.
        </p>
        <p>
          Neither problem was about trust. The honesty part already worked. The problem was that
          a table and a tin couldn&apos;t tell us what was happening, and couldn&apos;t take a
          payment when someone had no cash.
        </p>
        <p>So we started building the thing we wished we&apos;d had.</p>
      </section>

      <section className="space-y-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)]">
          What we wanted
        </h2>
        <p>
          Nothing complicated. We wanted to know, from the house, when something sold and when we
          were running low, before a customer drove up to an empty stall. And we wanted a way for
          people to pay by card too, for the ones with no cash. That part is coming.
        </p>
        <p>
          That&apos;s still the whole idea. Stallside is a QR code on the stall and an app on your
          phone. Customers scan, take what they&apos;re after, and pay. You get a message the
          moment something sells, your stock counts itself down, and you get a nudge before you
          run out. No one has to stand at the table. The honesty stays; the guessing goes.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)]">
          Why it&apos;s for more than eggs
        </h2>
        <p>
          Once we&apos;d built it for the egg stand, it was obvious it wasn&apos;t only about
          eggs.
        </p>
        <p>
          The same table-and-tin setup is everywhere once you start noticing it: firewood stacked
          at a gate, flowers in buckets at the end of a driveway, honesty car parks, camp-ground
          ice and milk, community fridges, the lady down the road selling jam. All of it runs on
          the same trust, and all of it hits the same two walls. You can&apos;t see what&apos;s
          selling, and you can&apos;t take a payment when someone&apos;s got no cash.
        </p>
        <p>
          So Stallside is for any of it. If you leave something out to sell and trust people to
          pay, it&apos;s for you.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)]">
          Still a small thing, built by people who use it
        </h2>
        <p>
          We&apos;re just a normal Aussie family. We built this because we needed it, we run
          our own stall on it, and we&apos;re figuring out the rest as we go. Honestly, that is
          the best position to build something from. Every feature has to earn its place at a
          real stall, on a real phone, 500 metres up a real road.
        </p>
        <p>
          If you run a stall of your own, we&apos;d genuinely like to hear how it goes. The eggs,
          for the record, are still selling.
        </p>
        <p className="pt-2 text-[var(--ink)]">
          From the Stallside team, regional Australia
        </p>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/"
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Back to home
        </Link>
        <Link
          href="/#pricing"
          className="rounded-[var(--radius-pill)] border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
        >
          See pricing
        </Link>
        <Link
          href="/contact"
          className="rounded-[var(--radius-pill)] border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
