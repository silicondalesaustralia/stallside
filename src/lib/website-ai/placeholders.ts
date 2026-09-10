export type PlaceholderKind =
  | "COPY_INSTRUCTIONAL"
  | "COPY_GENERIC"
  | "IMAGE_DECORATIVE"
  | "LOGO_MARK"
  | "SAMPLE_PRODUCTS"
  | "SETUP_STUB"
  | "POLICY_VARIABLE";

export type PublishSeverity = "MUST_FIX" | "REVIEW" | "NOT_LIVE";

export type PlaceholderStatus = "OPEN" | "REPLACED" | "ACCEPTED" | "REMOVED";

export type PlaceholderRecord = {
  id: string;
  kind: PlaceholderKind;
  status: PlaceholderStatus;
  source: "AI" | "TEMPLATE" | "SYSTEM";
  label: string;
  pageId?: string;
  nodeId?: string;
  propPath?: string;
};

export function placeholderSeverity(kind: PlaceholderKind): PublishSeverity {
  if (kind === "COPY_INSTRUCTIONAL") return "MUST_FIX";
  if (kind === "SETUP_STUB" || kind === "POLICY_VARIABLE") return "NOT_LIVE";
  return "REVIEW";
}

export function instructionalCopy(topic: string): string {
  return `Tell customers ${topic}…`;
}

export function genericWelcome(businessName: string): string {
  return `Welcome to ${businessName}.`;
}
