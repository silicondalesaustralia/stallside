import { z } from "zod";
import { mobilePlatform } from "./common";

export const otpRequestBody = z.object({
  email: z.email().max(254),
});
export type OtpRequestBody = z.infer<typeof otpRequestBody>;

export const otpVerifyBody = z.object({
  email: z.email().max(254),
  code: z.string().trim().regex(/^\d{6}$/),
  platform: mobilePlatform,
  deviceName: z.string().trim().max(100).optional(),
  appVersion: z.string().trim().max(32).optional(),
});
export type OtpVerifyBody = z.infer<typeof otpVerifyBody>;

export const otpVerifyResponse = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime(),
});
export type OtpVerifyResponse = z.infer<typeof otpVerifyResponse>;

export const logoutBody = z.object({
  pushToken: z.string().min(10).max(4096).optional(),
});
export type LogoutBody = z.infer<typeof logoutBody>;

export const webLinkBody = z.object({
  path: z.string().trim().min(1).max(500),
});
export type WebLinkBody = z.infer<typeof webLinkBody>;

export const webLinkResponse = z.object({ url: z.url() });
export type WebLinkResponse = z.infer<typeof webLinkResponse>;
