import { z } from "zod";

export const AUDIENCE_TYPES = ["all_marketing", "list", "preorder_page", "product", "customer"] as const;
export const audienceType = z.enum(AUDIENCE_TYPES);
export type AudienceType = z.infer<typeof audienceType>;

/** Who a message goes to; only the field for the chosen type is used. */
export const communicationAudience = z.object({
  audienceType,
  customerId: z.string().nullable(),
  listId: z.string().nullable(),
  preOrderPageId: z.string().nullable(),
  productIds: z.array(z.string().min(1)).max(300),
  /** For lists: the addresses ticked to receive it (unticked are left out). */
  recipientEmails: z.array(z.string()).max(5000),
});
export type CommunicationAudience = z.infer<typeof communicationAudience>;

/** Message form values; the web composer and the app both send this shape. */
export const communicationInput = communicationAudience.extend({
  subject: z.string().max(200),
  heading: z.string().max(200),
  /** HTML; sanitised on the server. */
  body: z.string().max(8000),
  ctaLabel: z.string().max(80),
  ctaUrl: z.string().max(500),
});
export type CommunicationInput = z.infer<typeof communicationInput>;

export const mobileCampaignRow = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["DRAFT", "SENDING", "SENT", "FAILED", "CANCELLED"]),
  sentCount: z.number().int(),
  failedCount: z.number().int(),
  recipientCount: z.number().int(),
  /** "all marketing", "list", … */
  audience: z.string(),
  createdAt: z.string(),
});
export type MobileCampaignRow = z.infer<typeof mobileCampaignRow>;

export const mobileStandingList = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  count: z.number().int(),
});
export type MobileStandingList = z.infer<typeof mobileStandingList>;

export const communicationResponse = z.object({
  campaigns: z.array(mobileCampaignRow),
  standingLists: z.array(mobileStandingList),
});
export type CommunicationResponse = z.infer<typeof communicationResponse>;

export const campaignDetailResponse = z.object({
  campaign: mobileCampaignRow,
  subject: z.string(),
  heading: z.string().nullable(),
  /** Body as plain text for display. */
  bodyText: z.string(),
  ctaLabel: z.string().nullable(),
  ctaUrl: z.string().nullable(),
  recipients: z.array(z.object({ email: z.string(), status: z.string(), errorMessage: z.string().nullable() })),
});
export type CampaignDetailResponse = z.infer<typeof campaignDetailResponse>;

const option = z.object({ id: z.string(), label: z.string() });
export const composeOptionsResponse = z.object({
  customers: z.array(option),
  products: z.array(option),
  lists: z.array(option),
  preOrderPages: z.array(option),
});
export type ComposeOptionsResponse = z.infer<typeof composeOptionsResponse>;

export const listMembersResponse = z.object({ emails: z.array(z.string()) });
export type ListMembersResponse = z.infer<typeof listMembersResponse>;

export const audienceCountResponse = z.object({ count: z.number().int() });
export type AudienceCountResponse = z.infer<typeof audienceCountResponse>;

export const campaignSendResponse = z.object({ id: z.string() });
export type CampaignSendResponse = z.infer<typeof campaignSendResponse>;
