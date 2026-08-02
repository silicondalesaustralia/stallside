import { impersonateOwner } from "@/app/admin/owners/impersonate-actions";

export default function AdminLoginAsButton({
  ownerId,
  compact = false,
}: {
  ownerId: string;
  compact?: boolean;
}) {
  const action = impersonateOwner.bind(null, ownerId);
  return (
    <form action={action}>
      <button
        type="submit"
        className={
          compact
            ? "rounded-md border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold hover:bg-[var(--wash)]"
            : "rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
        }
      >
        Login as
      </button>
    </form>
  );
}
