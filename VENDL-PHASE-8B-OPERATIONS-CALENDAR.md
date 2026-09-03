# Vendl Phase 8B — Operations Calendar (v2)

## Status

**Reopened and upgraded locally.** Not committed / pushed / deployed.

Brief: `VENDL-NEXT-PHASE-8B-OPERATIONS-CALENDAR.md` (philosophy updated below)

**No `CalendarEvent` table.** Calendar remains a projection; drag-and-drop updates **source domain objects**.

## Philosophy (v2)

> Calendar is an operational scheduling interface over Vendl's source objects. Supported source events can be moved/resized directly; all calendar mutations update the underlying domain object and pass domain-specific validation.

Still out of scope: personal appointments, Google Calendar sync.

## UI — FullCalendar

Replaced hand-built week/month/agenda cards with **FullCalendar v7** (`@fullcalendar/react`):

| View | FC plugin | Behaviour |
|------|-----------|-----------|
| **Month** | `dayGridMonth` | 7-column grid, events in cells, `+N more` → agenda for that day |
| **Week** | `timeGridWeek` | Horizontal days, timed events on axis, all-day row |
| **Agenda** | `listWeek` | Mobile-friendly list |

Toolbar: **Today · ← → · Month / Week / Agenda** (Google Calendar pattern).

**Click empty slot** → operational create sheet (market, menu, custom form, pickup setup).

Component: `src/app/dashboard/(gated)/calendar/CalendarScheduler.tsx`

## Source-aware rescheduling

```
Calendar drag/resize
  → rescheduleCalendarEventAction (server)
  → src/lib/calendar/reschedule.ts
  → update Menu / SellerEvent / PickupWindow / DeliveryZone / CustomOrderRequest
  → revalidate + re-project
```

| Handler | Source | Draggable | Resizable |
|---------|--------|-----------|-----------|
| `rescheduleMenuClose` | `Menu.orderByAt` | ✅ | — |
| `rescheduleMarketEvent` | `SellerEvent.startsAt/endsAt` | ✅ | ✅ |
| `rescheduleCustomOrderDueDate` | Form DATE answer in `CustomOrderRequest.answers` | ✅ | — (all-day) |
| `reschedulePickupWindow` | `PickupWindow` (weekly → weekday+times; one-off → startsAt/endsAt) | ✅ | ✅ |
| `rescheduleDeliveryWindow` | `DeliveryZone` weekday+times | ✅ | ✅ |

**Non-draggable (derived, no legitimate source schedule):**

- Production (from order collection dates)
- Packing (from fulfilment workload)
- Order-aggregated pickup/delivery/subscription blocks (derived from paid orders)

Pickup/delivery **window templates** are now projected separately (`project-windows.ts`) as timed, draggable blocks.

## New / changed files

| Path | Role |
|------|------|
| `src/lib/calendar/expand-windows.ts` | Expand weekly/one-off windows into range instances |
| `src/lib/calendar/project-windows.ts` | Project PickupWindow + DeliveryZone |
| `src/lib/calendar/reschedule.ts` | Domain reschedule handlers |
| `src/lib/calendar/fc-map.ts` | CalendarEvent → FullCalendar event |
| `src/app/dashboard/(gated)/calendar/CalendarScheduler.tsx` | FullCalendar client UI |
| `src/app/dashboard/(gated)/calendar/actions.ts` | `rescheduleCalendarEventAction` |
| `src/lib/calendar/types.ts` | `editable`, `durationEditable`, `rescheduleAction` |

Legacy `CalendarViews.tsx` / `CalendarEventCard.tsx` retained but unused by page (safe to remove later).

## Dependencies added

- `@fullcalendar/react`, `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/list`, `@fullcalendar/interaction`
- `temporal-polyfill` (FullCalendar peer)

## Tests

```bash
npm run test:calendar   # 8 tests (range, dedupe, window expansion)
npx tsc --noEmit
npm run build
```

## Manual smoke

- [ ] Month grid shows events in cells; `+N more` opens agenda for day
- [ ] Week view positions timed pickup/market blocks on time axis
- [ ] Drag menu close deadline → updates menu
- [ ] Drag market → updates event start/end
- [ ] Drag pickup window Sat 8–10 → Sun 9–11 → fulfilment pickup template updates
- [ ] Drag custom order due date → form request answer updates
- [ ] Packing/production blocks do not drag (or show error)
- [ ] Click empty slot → create sheet with operational links
- [ ] `/dashboard/events/new?startsAt=…` pre-fills from calendar

## Relation to Phase 8C

Dashboard IA (8C) remains in place. Calendar is still a primary sidebar item; this upgrade replaces only the calendar UX layer.
