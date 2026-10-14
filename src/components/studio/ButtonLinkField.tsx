"use client";

import { useState } from "react";
import { normaliseLinkInput } from "@/lib/website/rich-text/parse";
import { isButtonLink } from "@/lib/studio/button-link";
import { useStudioMetadata } from "./StudioEditorContext";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const URL_OPTION = "__url";
const PAGES = [
  ["page:home", "Home"],
  ["page:shop", "Shop"],
  ["page:about", "About"],
  ["page:contact", "Contact"],
  ["page:menu", "Menus"],
  ["page:blog", "Blog"],
] as const;

const isToken = (v: string) => /^(page|nav|product):/.test(v);

/** Where a button or menu link goes: a site page, custom page, product or any web address. */
export default function ButtonLinkField({
  value,
  label = "Button link",
  defaultLabel,
  emptyOptionLabel,
  onChange,
}: {
  value: string | undefined;
  label?: string;
  /** Text for the "Default (…)" choice; null hides it and asks the seller to choose. */
  defaultLabel: string | null;
  /** Replaces the whole "Default (…)" option text, e.g. "No link". */
  emptyOptionLabel?: string;
  onChange: (value: string | undefined) => void;
}) {
  const meta = useStudioMetadata();
  const stored = isButtonLink(value) ? value : "";
  const [urlMode, setUrlMode] = useState(Boolean(stored) && !isToken(stored));
  const [text, setText] = useState(stored && !isToken(stored) ? stored : "");
  const [error, setError] = useState<string | null>(null);
  const navPages = meta.linkablePages;

  function pick(next: string) {
    setError(null);
    if (next === URL_OPTION) {
      setUrlMode(true);
      return;
    }
    setUrlMode(false);
    onChange(next || undefined);
  }

  function commitUrl() {
    if (!text.trim()) {
      setError(null);
      onChange(undefined);
      return;
    }
    const href = normaliseLinkInput(text);
    if (!href) {
      setError("Use a web address (example.com), an email, a phone number (tel:…) or a /page path.");
      return;
    }
    setError(null);
    setText(href);
    onChange(href);
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[var(--field)]">{label}</label>
      <select className={INPUT} value={urlMode ? URL_OPTION : stored} onChange={(e) => pick(e.target.value)}>
        <option value="" disabled={defaultLabel === null}>
          {emptyOptionLabel ?? (defaultLabel === null ? "Choose where it goes…" : `Default (${defaultLabel})`)}
        </option>
        <optgroup label="Pages">
          {PAGES.map(([token, label]) => (
            <option key={token} value={token}>{label}</option>
          ))}
          {navPages
            .filter((p) => !["about", "contact", "blog", "shop"].includes(p.slug) && isButtonLink(`nav:${p.slug}`))
            .map((p) => (
              <option key={p.slug} value={`nav:${p.slug}`}>{p.label}</option>
            ))}
        </optgroup>
        {meta.products.length ? (
          <optgroup label="Products">
            {meta.products.filter((p) => isButtonLink(`product:${p.slug}`)).map((p) => (
              <option key={p.slug} value={`product:${p.slug}`}>{p.name}</option>
            ))}
          </optgroup>
        ) : null}
        <option value={URL_OPTION}>Web address, email or phone…</option>
      </select>
      {urlMode ? (
        <input
          className={INPUT}
          value={text}
          placeholder="example.com, hello@farm.com or tel:0400 000 000"
          onChange={(e) => setText(e.target.value)}
          onBlur={commitUrl}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitUrl();
          }}
        />
      ) : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      {urlMode && !error ? (
        <p className="text-xs text-[var(--muted)]">Other websites open in a new tab.</p>
      ) : null}
    </div>
  );
}
