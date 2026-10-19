import { z } from "zod";
import { mobilePlatform } from "./common";

export const pushRegisterBody = z.object({
  token: z.string().min(10).max(4096),
  platform: mobilePlatform,
});
export type PushRegisterBody = z.infer<typeof pushRegisterBody>;

export const pushUnregisterBody = z.object({
  token: z.string().min(10).max(4096),
});
export type PushUnregisterBody = z.infer<typeof pushUnregisterBody>;
