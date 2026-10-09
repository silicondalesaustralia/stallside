export type Diagnostic = {
  severity: "error" | "warning";
  /** Dotted location, e.g. "pages.home.sections.2.content.heading". */
  path: string;
  message: string;
};

export const error = (path: string, message: string): Diagnostic => ({
  severity: "error",
  path,
  message,
});

export const warning = (path: string, message: string): Diagnostic => ({
  severity: "warning",
  path,
  message,
});

export const hasErrors = (diagnostics: Diagnostic[]) =>
  diagnostics.some((d) => d.severity === "error");
