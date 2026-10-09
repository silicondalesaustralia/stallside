"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";

type StandOpt = { id: string; name: string };
type CatOpt = { id: string; title: string };

export default function NewQrCodeForm({
  action,
  stands,
  categories,
  defaultStandId,
  hasStorefront,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  stands: StandOpt[];
  categories: CatOpt[];
  defaultStandId: string;
  hasStorefront: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [linkMode, setLinkMode] = useState<"WEBSITE_HOME" | "WEBSITE_CATEGORY">(
    categories.length > 0 ? "WEBSITE_CATEGORY" : "WEBSITE_HOME",
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [name, setName] = useState(
    categories[0] ? `${categories[0].title} QR` : "Shop QR",
  );

  const inputClass =
    "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="dash-card flex flex-col gap-4 p-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Farm Stand"
        />
      </label>

      {stands.length > 1 ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Business</span>
          <select
            name="standId"
            defaultValue={defaultStandId}
            className={inputClass}
          >
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="standId" value={stands[0].id} />
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Opens</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="linkMode"
            value="WEBSITE_HOME"
            checked={linkMode === "WEBSITE_HOME"}
            onChange={() => {
              setLinkMode("WEBSITE_HOME");
              setName("Shop QR");
            }}
            className="mt-1"
          />
          <span>Whole website / shop home</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="linkMode"
            value="WEBSITE_CATEGORY"
            checked={linkMode === "WEBSITE_CATEGORY"}
            disabled={categories.length === 0}
            onChange={() => {
              setLinkMode("WEBSITE_CATEGORY");
              const cat = categories.find((c) => c.id === categoryId);
              if (cat) setName(`${cat.title} QR`);
            }}
            className="mt-1"
          />
          <span>One category (e.g. Farm Stand shelf)</span>
        </label>
      </fieldset>

      {linkMode === "WEBSITE_CATEGORY" ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Category</span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              const cat = categories.find((c) => c.id === e.target.value);
              if (cat) setName(`${cat.title} QR`);
            }}
            className={inputClass}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}

      <button
        type="submit"
        disabled={pending || !hasStorefront}
        className={dashCtaClass}
      >
        {pending ? "Creating…" : "Create QR code"}
      </button>
    </form>
  );
}
