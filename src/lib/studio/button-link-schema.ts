import { z } from "zod";
import { isButtonLink } from "./button-link";

export const buttonLinkSchema = z.string().refine(isButtonLink, "Pick a page, product or a valid web address.");
