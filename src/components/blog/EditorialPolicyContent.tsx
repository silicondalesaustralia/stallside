import Link from "next/link";
import { LEGAL_EMAIL } from "@/lib/legal";
import { authorsIndexPath } from "@/lib/blog/paths";

const h2 = "mt-10 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]";
const link = "font-semibold text-[var(--leaf-dark)] underline";

export default function EditorialPolicyContent() {
  return (
    <div className="flex flex-col gap-4 text-base leading-relaxed text-[var(--ink)] sm:text-lg">
      <p>
        Vendl publishes guides and news for farm stands, home producers, makers and small online sellers. This page
        explains how those articles are chosen, researched, written, checked and kept up to date.
      </p>

      <h2 className={h2}>Who is responsible</h2>
      <p>
        Every article names its author. The author reviews, edits and approves the article before it goes live and is
        accountable for what it says. You can read about each of them on our{" "}
        <Link href={authorsIndexPath()} className={link}>authors page</Link>.
      </p>

      <h2 className={h2}>How articles are made</h2>
      <p>
        We pick topics from the questions sellers actually ask: searches that lead people to our site, questions from
        Vendl users, our help articles, and news that affects small sellers.
      </p>
      <p>
        We use AI tools to help research topics and prepare first drafts. No article is published automatically. A
        person reads every draft, checks it against its sources, edits it and decides whether it is published.
      </p>

      <h2 className={h2}>Sources and fact-checking</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Rules and regulations come from the government department or regulator responsible, and we name the state or council they apply to.</li>
        <li>Facts about other platforms come from their own pricing, help and changelog pages, dated when we checked them.</li>
        <li>Facts about Vendl are checked against the product itself, not marketing copy.</li>
        <li>We do not invent interviews, customer stories, statistics or quotes. Examples that are hypothetical are labelled as examples.</li>
      </ul>

      <h2 className={h2}>Fairness</h2>
      <p>
        Vendl makes software for sellers, so we have an interest in the topics we cover. We say so, compare products on
        the criteria that matter to sellers, and say plainly when another platform is the better fit.
      </p>

      <h2 className={h2}>General information, not advice</h2>
      <p>
        Food, tax and business rules vary by state, council and circumstance. Our articles are general information and
        link to the official source. Check with your council or a qualified adviser before making decisions that depend
        on them.
      </p>

      <h2 className={h2}>Updates and corrections</h2>
      <p>
        We review articles when rules, prices or our product change, and show the date an article was last updated. If
        you spot an error, email <a href={`mailto:${LEGAL_EMAIL}`} className={link}>{LEGAL_EMAIL}</a> and we will
        check it and correct the article if needed.
      </p>
    </div>
  );
}
