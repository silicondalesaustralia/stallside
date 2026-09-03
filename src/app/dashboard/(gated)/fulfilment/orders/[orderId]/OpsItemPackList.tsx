"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleItemPacked } from "../actions";

export default function OpsItemPackList({
  items,
}: {
  items: {
    id: string;
    quantity: number;
    name: string;
    options: string | null;
    packed: boolean;
  }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.packed}
              disabled={pending}
              className="mt-0.5 size-4"
              onChange={(e) => {
                const packed = e.target.checked;
                startTransition(async () => {
                  const fd = new FormData();
                  fd.set("orderItemId", item.id);
                  fd.set("packed", packed ? "1" : "0");
                  await toggleItemPacked(fd);
                  router.refresh();
                });
              }}
            />
            <span>
              {item.quantity}× {item.name}
              {item.options ? ` (${item.options})` : ""}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
