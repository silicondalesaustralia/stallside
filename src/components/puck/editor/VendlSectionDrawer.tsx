"use client";

import { usePuck } from "@puckeditor/core";
import { sectionLabel } from "@/lib/puck/section-registry";

export default function VendlSectionDrawer({
  children,
  itemSelector,
}: {
  children: React.ReactNode;
  itemSelector?: { index: number; zone?: string } | null;
}) {
  const { selectedItem } = usePuck();

  if (!itemSelector || !selectedItem) return null;

  const label = sectionLabel(selectedItem.type);

  return (
    <>
      <MobileDrawerBackdrop />
      <aside className="vendl-section-drawer fixed bottom-0 right-0 z-50 flex max-h-[85vh] w-full flex-col border-l border-[var(--line)] bg-white shadow-xl lg:static lg:z-auto lg:max-h-none lg:w-80 lg:shrink-0 lg:shadow-none">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <h2 className="text-sm font-bold text-[var(--field)]">{label}</h2>
          <DrawerDoneButton />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </aside>
    </>
  );
}

function DrawerDoneButton() {
  const { dispatch } = usePuck();
  return (
    <button
      type="button"
      onClick={() =>
        dispatch({
          type: "setUi",
          ui: { itemSelector: null, rightSideBarVisible: false },
        })
      }
      className="rounded-lg bg-[var(--field)] px-3 py-1 text-xs font-semibold text-white"
    >
      Done
    </button>
  );
}

function MobileDrawerBackdrop() {
  const { dispatch } = usePuck();
  return (
    <div
      className="fixed inset-0 z-40 bg-black/20 lg:hidden"
      aria-hidden
      onClick={() =>
        dispatch({
          type: "setUi",
          ui: { itemSelector: null, rightSideBarVisible: false },
        })
      }
    />
  );
}

export function VendlFieldsOverride({
  children,
  itemSelector,
}: {
  children: React.ReactNode;
  itemSelector?: { index: number; zone?: string } | null;
  isLoading?: boolean;
}) {
  if (!itemSelector) return <></>;
  return <VendlSectionDrawer itemSelector={itemSelector}>{children}</VendlSectionDrawer>;
}
