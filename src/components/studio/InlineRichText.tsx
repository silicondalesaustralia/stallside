"use client";

import { lazy, Suspense, type ComponentProps } from "react";
import type InlineRichTextCraft from "./InlineRichTextCraft";
import RichText from "./RichText";

type Props = ComponentProps<typeof InlineRichTextCraft>;

/** Loaded on demand so Craft.js stays out of the public storefront bundle. */
const LazyInlineRichText = lazy(() => import("./InlineRichTextCraft"));

/** Click-to-edit rich body text; shows the formatted text while the editor loads. */
export default function InlineRichText(props: Props) {
  return (
    <Suspense fallback={<RichText value={props.value} className={props.className} />}>
      <LazyInlineRichText {...props} />
    </Suspense>
  );
}
