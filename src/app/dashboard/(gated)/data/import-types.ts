import type { ImportOutcome, ImportPreview, SectionId } from "@/lib/data-transfer/registry";

/** `preview` is null when the section can only be checked after earlier files import. */
export type SectionPreview = { section: SectionId; fileName: string; rowCount: number; preview: ImportPreview | null };

export type PreviewState = { ok: true; sections: SectionPreview[]; skipped: string[] } | { ok: false; error: string };

export type ApplyState =
  | { ok: true; results: ({ section: SectionId; fileName: string } & ImportOutcome)[]; stoppedAt?: string }
  | { ok: false; error: string };
