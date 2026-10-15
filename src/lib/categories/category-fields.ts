export const CATEGORY_DESCRIPTION_MAX = 2000;

function text(formData: FormData, key: string): string | null {
  return String(formData.get(key) ?? "").trim().slice(0, CATEGORY_DESCRIPTION_MAX) || null;
}

/** Only https image addresses are stored; anything else clears the thumbnail. */
function imageUrl(formData: FormData): string | null {
  const raw = String(formData.get("imageUrl") ?? "").trim();
  return /^https:\/\/\S+$/i.test(raw) && raw.length <= 2048 ? raw : null;
}

export function readCategoryFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim().slice(0, 80),
    description: text(formData, "description"),
    bottomDescription: text(formData, "bottomDescription"),
    imageUrl: imageUrl(formData),
  };
}
