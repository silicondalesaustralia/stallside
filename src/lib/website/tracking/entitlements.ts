import { ownerIdHasProAccess } from "@/lib/owner-pro-access";

/** Tags & Pixels (and server-side conversions) are a Pro feature, like custom domains. */
export const ownerCanUseTagsPixels = ownerIdHasProAccess;
