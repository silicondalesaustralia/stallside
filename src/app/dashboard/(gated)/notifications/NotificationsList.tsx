"use client";

import { useState, useTransition } from "react";
import { markNotificationRead, deleteNotification } from "./actions";
import type { Notification, Stand } from "@/generated/prisma/client";

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

function NotificationCard({
  notification,
}: {
  notification: NotificationWithStand;
}) {
  const [pending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  function handleMarkRead() {
    if (notification.isRead) return;
    startTransition(async () => {
      await markNotificationRead(notification.id);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteNotification(notification.id);
      setDeleted(true);
    });
  }

  if (deleted) return null;

  const metadata = notification.metadata as Record<string, any> | null;
  const email = metadata?.email;

  return (
    <div
      className={`dash-card rounded-2xl p-4 transition-opacity ${
        pending ? "opacity-50" : ""
      } ${!notification.isRead ? "border-2 border-[var(--marigold)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!notification.isRead ? (
              <span className="size-2 rounded-full bg-[var(--marigold)]" />
            ) : null}
            <h3 className="font-semibold">{notification.title}</h3>
          </div>
          {notification.stand ? (
            <p className="mt-0.5 text-sm text-[var(--ink-subtle)]">
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
          <p className="mt-2 text-xs text-[var(--ink-subtle)]">
            {new Date(notification.createdAt).toLocaleString("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {!notification.isRead ? (
            <button
              type="button"
              onClick={handleMarkRead}
              disabled={pending}
              className="rounded-lg bg-[var(--wash)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--line)] disabled:opacity-50"
            >
              Mark read
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
