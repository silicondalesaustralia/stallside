import { parseAccentColor } from "@/lib/stand-brand";
import { uploadStandLogo } from "@/lib/stand-logo-upload";
import { parseSocialUrl, STAND_SOCIALS } from "@/lib/stand-social";

type StandBrandRow = {
  id: string;
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
};

/** Parse branding fields from a stand form (shared by branding-only + combined save). */
export async function brandingDataFromForm(
  stand: StandBrandRow,
  formData: FormData,
): Promise<
  | {
      ok: true;
      data: {
        logoUrl: string | null;
        accentColor: string | null;
        secondaryColor: string | null;
        instagramUrl: string | null;
        facebookUrl: string | null;
        tiktokUrl: string | null;
        youtubeUrl: string | null;
        websiteUrl: string | null;
      };
    }
  | { ok: false; error: string }
> {
  const accentRaw = String(formData.get("accentColor") ?? "").trim();
  let accentColor: string | null = stand.accentColor;
  if (formData.get("clearAccent") === "on") {
    accentColor = null;
  } else if (accentRaw) {
    const parsed = parseAccentColor(accentRaw);
    if (!parsed) return { ok: false, error: "Primary must be a hex colour like #2e7d3f." };
    accentColor = parsed;
  }

  const secondaryRaw = String(formData.get("secondaryColor") ?? "").trim();
  let secondaryColor: string | null = stand.secondaryColor;
  if (formData.get("clearSecondary") === "on") {
    secondaryColor = null;
  } else if (secondaryRaw) {
    const parsed = parseAccentColor(secondaryRaw);
    if (!parsed) {
      return { ok: false, error: "Secondary must be a hex colour like #2e7d3f." };
    }
    secondaryColor = parsed;
  }

  let logoUrl: string | null = stand.logoUrl;
  if (formData.get("clearLogo") === "on") {
    logoUrl = null;
  } else {
    const file = formData.get("logo");
    if (file instanceof File && file.size > 0) {
      try {
        logoUrl = await uploadStandLogo(stand.id, file);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not upload logo.";
        return { ok: false, error: message };
      }
    }
  }

  const socialData: Record<string, string | null> = {};
  for (const social of STAND_SOCIALS) {
    const parsed = parseSocialUrl(String(formData.get(social.field) ?? ""));
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return { ok: false, error: `${social.label}: ${parsed.error}` };
    }
    socialData[social.field] = parsed;
  }

  return {
    ok: true,
    data: {
      logoUrl,
      accentColor,
      secondaryColor,
      instagramUrl: socialData.instagramUrl ?? null,
      facebookUrl: socialData.facebookUrl ?? null,
      tiktokUrl: socialData.tiktokUrl ?? null,
      youtubeUrl: socialData.youtubeUrl ?? null,
      websiteUrl: socialData.websiteUrl ?? null,
    },
  };
}
