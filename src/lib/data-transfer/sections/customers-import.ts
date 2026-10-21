import { prisma } from "@/lib/prisma";
import type { Importer, PlannedRow, RowError } from "../context";
import { duplicateKeys, RowReader } from "../row-reader";
import { parseYesNo } from "../values";

type CustomerRow = {
  email?: string;
  name?: string;
  phone?: string;
  notes?: string;
  marketingConsent?: boolean;
  source?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const customersImporter: Importer<CustomerRow> = {
  async plan(rows, ctx) {
    const existing = await prisma.customer.findMany({
      where: { ownerId: ctx.ownerId },
      select: { id: true, email: true, phone: true },
    });
    const byEmail = new Map(existing.filter((c) => c.email).map((c) => [c.email!, c.id]));
    const byPhone = new Map(existing.filter((c) => c.phone && !c.email).map((c) => [c.phone!, c.id]));
    const planned: PlannedRow<CustomerRow>[] = [];
    const errors: RowError[] = [];
    for (const row of rows) {
      const r = new RowReader(row);
      const email = r.text("email", 254)?.toLowerCase();
      const data: CustomerRow = {
        email,
        name: r.text("name", 120),
        phone: r.text("phone", 40),
        notes: r.text("notes", 5000),
        marketingConsent: r.parse("marketing_consent", parseYesNo, "yes or no"),
        source: r.text("source", 120),
      };
      if (email && !EMAIL.test(email)) r.errors.push(`email "${email}" is not valid`);
      if (!email && !data.phone && !data.name) r.errors.push("needs at least an email, phone or name");
      const existingId = (email ? byEmail.get(email) : data.phone ? byPhone.get(data.phone) : undefined) ?? null;
      errors.push(...r.toErrors());
      planned.push({ line: row.line, existingId, label: data.name ?? email ?? data.phone ?? "", data });
    }
    errors.push(...duplicateKeys(planned.map((p) => p.data.email), planned.map((p) => p.line), "Email"));
    return { rows: planned, errors };
  },

  async apply(plan, ctx) {
    let created = 0;
    let updated = 0;
    for (const row of plan.rows) {
      const d = row.data;
      const current = row.existingId
        ? await prisma.customer.findUnique({ where: { id: row.existingId }, select: { marketingConsent: true } })
        : null;
      const consentChanged = d.marketingConsent !== undefined && d.marketingConsent !== current?.marketingConsent;
      const consentAt = consentChanged ? (d.marketingConsent ? new Date() : null) : undefined;
      const fields = {
        name: d.name,
        phone: d.phone,
        notes: d.notes,
        source: d.source ?? (row.existingId ? undefined : "Import"),
        marketingConsent: d.marketingConsent,
        marketingConsentAt: consentAt,
      };
      if (row.existingId) {
        await prisma.customer.update({ where: { id: row.existingId }, data: fields });
        updated += 1;
      } else {
        await prisma.customer.create({ data: { ...fields, ownerId: ctx.ownerId, email: d.email } });
        created += 1;
      }
    }
    return { created, updated, warnings: [] };
  },
};
