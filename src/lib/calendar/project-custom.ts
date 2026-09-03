import {
  CustomOrderFieldType,
  CustomOrderRequestStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { dayKeyInTz } from "./range";
import type { CalendarEvent } from "./types";

function parseDueFromAnswers(
  answers: unknown,
  dateFieldLabels: Set<string>,
): { date: Date; label: string } | null {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return null;
  }
  for (const [label, value] of Object.entries(answers as Record<string, string>)) {
    if (!dateFieldLabels.has(label)) continue;
    const raw = String(value).trim();
    if (!raw) continue;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return { date: d, label };
  }
  return null;
}

export async function projectCustomOrderEvents(input: {
  ownerId: string;
  start: Date;
  end: Date;
  timeZone: string;
}): Promise<CalendarEvent[]> {
  const where: Prisma.CustomOrderRequestWhereInput = {
    ownerId: input.ownerId,
    status: {
      in: [
        CustomOrderRequestStatus.SUBMITTED,
        CustomOrderRequestStatus.REVIEWING,
        CustomOrderRequestStatus.ACCEPTED,
      ],
    },
    convertedOrder: null,
  };

  const requests = await prisma.customOrderRequest.findMany({
    where,
    include: {
      form: {
        select: {
          id: true,
          title: true,
          fields: { select: { label: true, fieldType: true } },
        },
      },
    },
  });

  const events: CalendarEvent[] = [];

  for (const r of requests) {
    const dateLabels = new Set(
      r.form.fields
        .filter((f) => f.fieldType === CustomOrderFieldType.DATE)
        .map((f) => f.label),
    );
    const due = parseDueFromAnswers(r.answers, dateLabels);
    if (!due || due.date < input.start || due.date >= input.end) continue;

    const dk = dayKeyInTz(due.date, input.timeZone);
    const name = r.customerName?.trim() || "Customer";
    events.push({
      id: `custom:${r.id}`,
      type: "custom_order",
      title: `${r.form.title} — ${name}`,
      startsAt: due.date,
      endsAt: null,
      allDay: true,
      status: r.status,
      sourceType: "custom_order_request",
      sourceId: r.id,
      href: `/dashboard/forms/requests/${r.id}`,
      editHref: `/dashboard/forms/${r.form.id}`,
      location: null,
      summary: "Due",
      dayKey: dk,
      sortKey: due.date.toISOString(),
      metadata: { dateFieldLabel: due.label },
      editable: true,
      durationEditable: false,
      rescheduleAction: "custom_order",
    });
  }

  return events;
}
