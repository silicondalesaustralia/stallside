"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Loader2, X } from "lucide-react";
import { listProductMediaLibrary } from "../product-gallery-actions";

type Asset = { id: string; url: string; fileName: string };

/** Modal to pick an existing library photo for this product. */
export default function ProductMediaLibraryPicker({
  busy,
  onPick,
}: {
  busy: boolean;
  onPick: (assetId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void listProductMediaLibrary()
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setError(result.error);
          setAssets([]);
          return;
        }
        setAssets(result.assets);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load the library.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen(true)}
        className="flex aspect-square size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--line)] bg-white p-2 text-center text-xs font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)] hover:bg-[var(--wash)] disabled:opacity-60"
      >
        <FolderOpen className="size-6" aria-hidden />
        Library
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Choose from photo library"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-[var(--field)]">Photo library</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[var(--muted)] hover:bg-[var(--wash)]"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Photos from Data management → Photo library.{" "}
              <a href="/dashboard/data?tab=library" className="underline">
                Manage library
              </a>
            </p>
            {loading ? (
              <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Loading…
              </p>
            ) : null}
            {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
            {!loading && !error && assets.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No library photos yet. Upload a batch under Data management → Photo library.
              </p>
            ) : null}
            <ul className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    disabled={busy}
                    title={asset.fileName}
                    onClick={() => {
                      onPick(asset.id);
                      setOpen(false);
                    }}
                    className="aspect-square w-full overflow-hidden rounded-lg border border-[var(--line)] hover:border-[var(--leaf)] disabled:opacity-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
