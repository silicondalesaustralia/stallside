import { z } from "zod";
import { SECTION_TEXT_KEY, SECTION_TEXT_MAX, SECTION_TEXT_MAX_KEYS } from "./section-texts";

export const sectionTextsSchema = z
  .record(z.string().regex(SECTION_TEXT_KEY), z.string().max(SECTION_TEXT_MAX))
  .refine((v) => Object.keys(v).length <= SECTION_TEXT_MAX_KEYS, "Too many text overrides.");
