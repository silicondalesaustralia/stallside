import { prisma } from "@/lib/prisma";

const MAX_ROWS = 1000;

export type EmailRecipientRow = {
  id: string;
  email: string;
  subject: string;
  sentAt: Date;
  status: string;
  lastEvent: string | null;
  openCount: number;
  clickCount: number;
  bounceType: string | null;
  error: string | null;
};

export async function loadEmailRecipients(kind: string): Promise<EmailRecipientRow[]> {
  const rows = await prisma.emailSendLog.findMany({
    where: {
      kind: kind === "unlabelled" ? null : kind,
      status: { not: "console" },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    select: {
      id: true,
      toEmails: true,
      subject: true,
      createdAt: true,
      status: true,
      lastEvent: true,
      openCount: true,
      clickCount: true,
      bounceType: true,
      error: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    email: row.toEmails.join(", "),
    subject: row.subject,
    sentAt: row.createdAt,
    status: row.status,
    lastEvent: row.lastEvent,
    openCount: row.openCount,
    clickCount: row.clickCount,
    bounceType: row.bounceType,
    error: row.error,
  }));
}
