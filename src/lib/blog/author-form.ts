import { z } from "zod";
import { slugifyBlogTitle } from "./slug";

const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

/** Avatars render through next/image, so only blob storage or site paths are allowed. */
function isAllowedAvatarUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && BLOB_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

function lines(value: string, separator: RegExp) {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

const authorFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  slug: z.string().trim().max(80).optional(),
  jobTitle: z.string().trim().min(2, "Job title is required").max(100),
  shortBio: z.string().trim().min(40, "Short bio needs at least 40 characters").max(300),
  bio: z.string().trim().max(5000),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || isAllowedAvatarUrl(v), "Photo must be uploaded here or be a site path like /team/jono.jpg"),
  expertise: z.string().max(1000),
  sameAs: z.string().max(3000),
  isDefault: z.boolean(),
  active: z.boolean(),
});

/** Admin author form → BlogAuthor fields. Throws with a readable message. */
export function parseBlogAuthorForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const parsed = authorFormSchema.safeParse({
    name: text("name"),
    slug: text("slug"),
    jobTitle: text("jobTitle"),
    shortBio: text("shortBio"),
    bio: text("bio"),
    avatarUrl: text("avatarUrl"),
    expertise: text("expertise"),
    sameAs: text("sameAs"),
    isDefault: formData.get("isDefault") === "on",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const d = parsed.data;
  const sameAs = lines(d.sameAs, /\r?\n/);
  const badLink = sameAs.find((url) => !/^https:\/\/[^\s]+$/.test(url));
  if (badLink) throw new Error(`Profile links must start with https:// (${badLink})`);

  return {
    slug: slugifyBlogTitle(d.slug || d.name),
    data: {
      name: d.name,
      jobTitle: d.jobTitle,
      shortBio: d.shortBio,
      bio: d.bio,
      avatarUrl: d.avatarUrl || null,
      expertise: lines(d.expertise, /,/).slice(0, 12),
      sameAs: sameAs.slice(0, 12),
      isDefault: d.isDefault && d.active,
      active: d.active,
    },
  };
}
