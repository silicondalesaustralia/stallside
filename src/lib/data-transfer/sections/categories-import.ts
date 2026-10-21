import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { Importer, PlannedRow, RowError } from "../context";
import { copyImages } from "../image-copy";
import { duplicateKeys, RowReader } from "../row-reader";
import { parseWholeNumber, parseYesNo } from "../values";

type CategoryRow = {
  slug: string;
  title?: string;
  description?: string;
  bottomDescription?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  showOnWebsite?: boolean;
};

export const categoriesImporter: Importer<CategoryRow> = {
  async plan(rows, ctx) {
    const existing = await prisma.category.findMany({
      where: { ownerId: ctx.ownerId },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(existing.map((c) => [c.slug, c.id]));
    const planned: PlannedRow<CategoryRow>[] = [];
    const errors: RowError[] = [];
    for (const row of rows) {
      const r = new RowReader(row);
      const title = r.text("title", 120);
      const slug = slugify(r.text("slug", 80) ?? title ?? "");
      const data: CategoryRow = {
        slug,
        title,
        description: r.text("description", 5000),
        bottomDescription: r.text("bottom_description", 5000),
        imageUrl: r.text("image_url", 1000),
        sortOrder: r.parse("sort_order", parseWholeNumber, "a whole number"),
        isActive: r.parse("active", parseYesNo, "yes or no"),
        showOnWebsite: r.parse("show_on_website", parseYesNo, "yes or no"),
      };
      const existingId = bySlug.get(slug) ?? null;
      if (!slug) r.errors.push("slug or title is required");
      if (!existingId && !title) r.errors.push("title is required for a new category");
      errors.push(...r.toErrors());
      planned.push({ line: row.line, existingId, label: title ?? slug, data });
    }
    errors.push(...duplicateKeys(planned.map((p) => p.data.slug), planned.map((p) => p.line), "Slug"));
    return { rows: planned, errors };
  },

  async apply(plan, ctx) {
    const warnings: string[] = [];
    let created = 0;
    let updated = 0;
    for (const row of plan.rows) {
      const d = row.data;
      const [imageUrl] = d.imageUrl
        ? await copyImages([d.imageUrl], ctx.stand.id, "categories", (m) => warnings.push(`Row ${row.line}: ${m}`))
        : [];
      const fields = {
        title: d.title,
        description: d.description,
        bottomDescription: d.bottomDescription,
        imageUrl,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
        showOnWebsite: d.showOnWebsite,
      };
      if (row.existingId) {
        await prisma.category.update({ where: { id: row.existingId }, data: fields });
        updated += 1;
      } else {
        await prisma.category.create({
          data: { ...fields, ownerId: ctx.ownerId, slug: d.slug, title: d.title ?? d.slug },
        });
        created += 1;
      }
    }
    return { created, updated, warnings };
  },
};
