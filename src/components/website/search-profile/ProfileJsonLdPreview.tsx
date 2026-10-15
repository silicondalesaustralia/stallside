/** The structured data your home page publishes, with links to Google's and schema.org's checkers. */
export default function ProfileJsonLdPreview({
  graph,
  liveUrl,
  isPublished,
}: {
  graph: Record<string, unknown>;
  liveUrl: string;
  isPublished: boolean;
}) {
  const encoded = encodeURIComponent(liveUrl);
  return (
    <details className="rounded-xl border border-dashed border-[var(--line)] p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-[var(--field)]">
        Preview your structured data (JSON-LD)
      </summary>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Every page also adds its own details: products with price, sale price, stock, shipping and review stars;
        categories and blog lists; blog posts with the author; FAQs; and breadcrumbs.
      </p>
      {isPublished ? (
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
          <a
            href={`https://search.google.com/test/rich-results?url=${encoded}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--leaf-dark)] underline"
          >
            Test in Google Rich Results
          </a>
          <a
            href={`https://validator.schema.org/#url=${encoded}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--leaf-dark)] underline"
          >
            Check with Schema.org validator
          </a>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--muted)]">Publish your site to test it with Google.</p>
      )}
      <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-[var(--paper,#f6f5f1)] p-3 text-xs leading-relaxed">
        {JSON.stringify(graph, null, 2)}
      </pre>
    </details>
  );
}
