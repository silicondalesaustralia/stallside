import { CUSTOM_HEAD_MAX_CHARS } from "@/lib/website/tracking/custom-code";
import { tagsCardClass, tagsInputClass } from "./tags-styles";

export default function CustomCodeField({ value }: { value: string }) {
  return (
    <section className={tagsCardClass}>
      <h2 className="font-semibold text-[var(--field)]">Custom code</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        For any other tool. Paste its <code>&lt;script&gt;</code> or <code>&lt;meta&gt;</code> tags; anything else is
        ignored. Scripts must load over https and only run on your own website address (your vendl.app subdomain or
        custom domain), after cookie consent where it&apos;s required.
      </p>
      <textarea
        name="customHead"
        defaultValue={value}
        rows={6}
        maxLength={CUSTOM_HEAD_MAX_CHARS}
        spellCheck={false}
        placeholder={'<script async src="https://example.com/tag.js"></script>'}
        className={tagsInputClass}
      />
      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        Custom code runs on every page of your website and can read anything shoppers type, including at checkout.
        Only add code from a company you trust.
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input type="checkbox" name="customAck" className="mt-1" />
        <span>I trust this code and take responsibility for it.</span>
      </label>
    </section>
  );
}
