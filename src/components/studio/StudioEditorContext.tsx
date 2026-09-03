"use client";

export {
  CraftEditorProvider as StudioEditorProvider,
  useCraftEditorChrome as useStudioEditorChrome,
} from "@/components/craft/CraftEditorContext";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import type { StudioMetadata } from "@/lib/studio/types";

export function useStudioMetadata(): StudioMetadata {
  return useCraftMetadata() as StudioMetadata;
}
