"use client";

import { lazy, Suspense, createElement, type ComponentProps } from "react";
import type EditableTextElementCraft from "./EditableTextElementCraft";

export type { TextTag } from "./EditableTextElementCraft";

type Props = ComponentProps<typeof EditableTextElementCraft>;

/** Loaded on demand so Craft.js stays out of the public storefront bundle. */
const LazyEditableText = lazy(() => import("./EditableTextElementCraft"));

/** The contentEditable element behind `InlineEditableText`; shows plain text while loading. */
export default function EditableTextElement(props: Props) {
  const fallback = createElement(
    props.as,
    { className: `inline-editable ${props.className}`.trim() },
    props.value,
  );
  return (
    <Suspense fallback={fallback}>
      <LazyEditableText {...props} />
    </Suspense>
  );
}
