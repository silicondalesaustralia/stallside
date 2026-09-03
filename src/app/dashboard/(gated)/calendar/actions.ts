"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import {
  rescheduleCalendarEvent,
  type RescheduleResult,
} from "@/lib/calendar/reschedule";
import type { CalendarRescheduleAction } from "@/lib/calendar/types";

export async function rescheduleCalendarEventAction(input: {
  rescheduleAction: CalendarRescheduleAction;
  sourceId: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<RescheduleResult> {
  const { owner } = await requireOwnerWrite();

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: "Invalid start time." };
  }

  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (endsAt && Number.isNaN(endsAt.getTime())) {
    return { ok: false, error: "Invalid end time." };
  }

  const result = await rescheduleCalendarEvent({
    ownerId: owner.id,
    action: input.rescheduleAction,
    sourceId: input.sourceId,
    startsAt,
    endsAt,
    allDay: input.allDay,
    metadata: input.metadata,
  });

  if (result.ok) {
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/operate");
    revalidatePath("/dashboard/menus");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/forms");
    revalidatePath("/dashboard/fulfilment");
  }

  return result;
}
