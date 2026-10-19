import BlogCountedField from "@/components/blog/BlogCountedField";

export type RevisionSeo = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
};

const FIELDS: Array<{ key: keyof RevisionSeo; label: string; max: number; ideal?: number; multiline?: boolean }> = [
  { key: "title", label: "Title (H1)", max: 160 },
  { key: "seoTitle", label: "SEO title", max: 70, ideal: 40 },
  { key: "seoDescription", label: "SEO description", max: 170, ideal: 120, multiline: true },
  { key: "excerpt", label: "Excerpt", max: 400, ideal: 80, multiline: true },
];

/** Proposed SEO values, with the current live value shown when the agent changed it. */
export default function RevisionSeoFields({ base, proposed }: { base: RevisionSeo; proposed: RevisionSeo }) {
  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">Search appearance</h2>
      {FIELDS.map((field) => {
        const changed = base[field.key] !== proposed[field.key];
        return (
          <div key={field.key} className={changed ? "blog-diff-added rounded-md" : ""}>
            <BlogCountedField
              name={field.key}
              label={changed ? `${field.label} (changed)` : field.label}
              defaultValue={proposed[field.key]}
              max={field.max}
              ideal={field.ideal}
              multiline={field.multiline}
            />
            {changed ? (
              <p className="mt-1 text-xs text-[var(--muted)]">
                <span className="font-semibold">Was:</span> {base[field.key] || "(empty)"}
              </p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
