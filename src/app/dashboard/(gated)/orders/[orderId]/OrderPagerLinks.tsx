import Link from "next/link";
import { secondaryButtonClass } from "@/components/dashboard/ui/button-styles";

function Arrow({ id, label, glyph }: { id: string | null; label: string; glyph: string }) {
  if (!id) {
    return (
      <span aria-disabled className={`${secondaryButtonClass} cursor-default px-2.5 opacity-40`}>
        <span aria-hidden>{glyph}</span>
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return (
    <Link href={`/dashboard/orders/${id}`} className={`${secondaryButtonClass} px-2.5`} title={label}>
      <span aria-hidden>{glyph}</span>
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Up = newer order, down = older order (matches the newest-first list). */
export default function OrderPagerLinks({ newerId, olderId }: { newerId: string | null; olderId: string | null }) {
  return (
    <div className="flex gap-1">
      <Arrow id={newerId} label="Newer order" glyph="↑" />
      <Arrow id={olderId} label="Older order" glyph="↓" />
    </div>
  );
}
