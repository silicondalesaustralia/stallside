"use client";

import { useState, useTransition } from "react";
import {
  deleteNotification,
  setNotificationStatus,
} from "./actions";
import type {
  Notification,
  NotificationStatus,
  Stand,
} from "@/generated/prisma/client";
import Link from "next/link";

type NotificationWithStand = Notification & { stand: Stand | null };

export default function NotificationsList({
  notifications,
}: {
  notifications: NotificationWithStand[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function statusLabel(status: NotificationStatus) {
  if (status === "ACTIONED") return "Actioned";
  if (status === "CLOSED") return "Closed";
  return "Open";
}

function NotificationCard({
  notification,
}: {
  notification: NotificationWithStand;
}) {
  const [pending, startTransition] = useTransition();
  const [gone, setGone] = useState(false);
  const [status, setStatus] = useState(notification.status);

  function setNextStatus(next: NotificationStatus) {
    startTransition(async () => {
      await setNotificationStatus(notification.id, next);
      setStatus(next);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteNotification(notification.id);
      setGone(true);
    });
  }

  if (gone) return null;

  const metadata = notification.metadata as Record<string, unknown> | null;
  const email =
    typeof metadata?.email === "string" ? metadata.email : null;
  const setupPath =
    typeof metadata?.setupPath === "string" ? metadata.setupPath : null;
  const isOpen = status === "OPEN";

  return (
    <div
      className={`dash-card rounded-2xl p-4 transition-opacity ${
        pending ? "opacity-50" : ""
      } ${isOpen ? "border-2 border-[var(--marigold)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isOpen ? (
              <span className="size-2 rounded-full bg-[var(--gone)]" />
            ) : null}
            <h3 className="font-semibold">{notification.title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                isOpen
                  ? "bg-[var(--marigold)]/20 text-[var(--field)]"
                  : "bg-[var(--wash)] text-[var(--muted)]"
              }`}
            >
              {statusLabel(status)}
            </span>
          </div>
          {notification.stand ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {notification.stand.name}
            </p>
          ) : null}
          <p className="mt-2 text-sm">{notification.message}</p>
          {email ? (
            <p className="mt-2">
              <a
                href={`mailto:${email}`}
                className="text-sm font-medium text-[var(--leaf)] hover:underline"
              >
                {email}
              </a>
            </p>
          ) : null}
          {setupPath ? (
            <p className="mt-2">
              <Link
                href={setupPath}
                className="text-sm font-semibold text-[var(--leaf-dark)] underline"
              >
                Open setup →
              </Link>
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[var(--muted)]">
            {new Date(notification.createdAt).toLocaleString("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {status !== "ACTIONED" ? (
            <button
              type="button"
              onClick={() => setNextStatus("ACTIONED")}
              disabled={pending}
              className="rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
            >
              Actioned
            </button>
          ) : null}
          {status !== "CLOSED" ? (
            <button
              type="button"
              onClick={() => setNextStatus("CLOSED")}
              disabled={pending}
              className="rounded-lg bg-[var(--wash)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--line)] disabled:opacity-50"
            >
              Closed
            </button>
          ) : null}
          {status !== "OPEN" ? (
            <button
              type="button"
              onClick={() => setNextStatus("OPEN")}
              disabled={pending}
              className="rounded-lg bg-[var(--wash)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--line)] disabled:opacity-50"
            >
              Reopen
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg bg-[var(--wash)] px-3 py-1.5 text-xs font-medium text-[var(--gone)] hover:bg-[var(--gone)]/10 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
