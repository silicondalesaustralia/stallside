"use client";

import { useState } from "react";
import { useWebAddressPreview } from "@/components/web-address/use-web-address-preview";
import WebAddressHint from "@/components/web-address/WebAddressHint";

export default function BusinessNameAddressField() {
  const [name, setName] = useState("");
  const preview = useWebAddressPreview(name);
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Business name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Green Valley Eggs"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>
      <WebAddressHint preview={preview} label="Your website will be at" />
    </div>
  );
}
