"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "./actions";

export default function NotificationsHeader({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Notifications
        </h1>
        {unreadCount > 0 ? (
          <p className="mt-1 text-sm text-[var(--ink-subtle)]">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
      {unreadCount > 0 ? (
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={pending}
          className="text-sm font-medium text-[var(--leaf)] hover:underline disabled:opacity-50"
        >
          Mark all as read
        </button>
      ) : null}
    </div>
  );
}
