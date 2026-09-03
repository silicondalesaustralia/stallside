"use client";

import { createContext, useContext, type ReactNode } from "react";

const StorefrontLinkContext = createContext<{
  slug: string;
  basePath: string;
  draft?: boolean;
}>({ slug: "", basePath: "" });

export function StorefrontLinkProvider({
  slug,
  basePath,
  draft,
  children,
}: {
  slug: string;
  basePath: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <StorefrontLinkContext.Provider value={{ slug, basePath, draft }}>
      {children}
    </StorefrontLinkContext.Provider>
  );
}

export function useStorefrontLinkBase() {
  return useContext(StorefrontLinkContext);
}
