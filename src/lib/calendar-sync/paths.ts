import { parseOAuthReturnPath } from "@/lib/products/productRoutes";
import { CONNECTORS_PATH } from "@/lib/socialHost/hostConfig";

/** Allowlisted page to land on after the Google consent screen (defaults to Connectors). */
export function calendarReturnUrl(reqUrl: string, returnPath: string | null): URL {
  return new URL(parseOAuthReturnPath(returnPath) ?? CONNECTORS_PATH, reqUrl);
}
