import { LP_CTA_PARAM_SCRIPT } from "@/lib/lp-signup-href";

/** Inline (no React client bundle) — rewrites CTA hrefs from the URL query. */
export default function LpCtaParamScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: LP_CTA_PARAM_SCRIPT }}
    />
  );
}
