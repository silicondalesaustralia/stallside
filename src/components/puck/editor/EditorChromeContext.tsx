"use client";

import { createContext, useContext } from "react";
import type { BusinessMode } from "@/lib/business-mode";
import type { PuckSpikeMetadata } from "@/lib/puck/types";

type EditorChromeState = {
  addAtIndex: number | null;
  setAddAtIndex: (index: number | null) => void;
  showSectionsPanel: boolean;
  setShowSectionsPanel: (open: boolean) => void;
  previewUrl: string;
  isPublished: boolean;
  pending: boolean;
  dirty: boolean;
  saveStatus: "idle" | "saving" | "saved";
  onSave: () => void;
  onPublish: () => void;
  metadata: PuckSpikeMetadata;
  businessMode: BusinessMode;
};

const EditorChromeContext = createContext<EditorChromeState | null>(null);

export function EditorChromeProvider({
  value,
  children,
}: {
  value: EditorChromeState;
  children: React.ReactNode;
}) {
  return (
    <EditorChromeContext.Provider value={value}>
      {children}
    </EditorChromeContext.Provider>
  );
}

export function useEditorChrome() {
  const ctx = useContext(EditorChromeContext);
  if (!ctx) throw new Error("useEditorChrome outside provider");
  return ctx;
}
