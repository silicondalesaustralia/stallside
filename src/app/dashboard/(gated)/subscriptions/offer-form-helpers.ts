import { uploadSubscriptionOfferImage } from "@/lib/subscription-offer-image-upload";

export async function resolveOfferImageUrl(input: {
  formData: FormData;
  standId: string;
  offerId: string;
  existingUrl: string | null;
}): Promise<{ ok: true; imageUrl: string | null } | { ok: false; error: string }> {
  if (input.formData.get("clearImage") === "on") {
    return { ok: true, imageUrl: null };
  }
  const imageFile = input.formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size <= 0) {
    return { ok: true, imageUrl: input.existingUrl };
  }
  try {
    const imageUrl = await uploadSubscriptionOfferImage(
      input.standId,
      input.offerId,
      imageFile,
    );
    return { ok: true, imageUrl };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not upload that photo.",
    };
  }
}

export function parseOptionalDollarsToCents(
  raw: FormDataEntryValue | null,
  enabled: boolean,
): number | null | { error: string } {
  if (!enabled) return null;
  const text = String(raw ?? "").trim();
  if (!text) return { error: "Enter a price for each enabled payment plan." };
  const n = Number.parseFloat(text);
  if (!Number.isFinite(n) || n < 0.5) {
    return { error: "Each plan price must be at least $0.50." };
  }
  return Math.round(n * 100);
}
