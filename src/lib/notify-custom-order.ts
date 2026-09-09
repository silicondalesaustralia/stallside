import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import { sendOwnerEmail } from "@/lib/notify-email";
import { sendOwnerPush } from "@/lib/notify-push";
import { ownerAlertRecipients } from "@/lib/owner-alert-recipients";

export async function notifyCustomOrderRequest(requestId: string) {
  const request = await prisma.customOrderRequest.findUnique({
    where: { id: requestId },
    include: {
      form: { select: { id: true, title: true } },
      owner: { include: { user: true } },
    },
  });
  if (!request) return;

  const setupPath = `/dashboard/forms/requests/${request.id}`;
  const dashHref = `${appBaseUrl()}${setupPath}`;
  const who =
    request.customerName ||
    request.email ||
    request.phone ||
    "A customer";
  const title = `Custom order · ${request.form.title}`;
  const message = `${who} submitted a request`;

  await prisma.notification.create({
    data: {
      ownerId: request.ownerId,
      type: "OTHER",
      status: "OPEN",
      title,
      message,
      metadata: {
        email: request.email,
        setupPath,
        dashHref,
        linkLabel: "View request",
        requestId: request.id,
        formId: request.formId,
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${request.formId}`);

  const emailOn = request.owner.emailAlertsEnabled;
  const pushOn = request.owner.pushAlertsEnabled;
  const recipients = ownerAlertRecipients(request.owner);

  if (emailOn && recipients.length) {
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
        <p style="font-size:18px;font-weight:600">${title}</p>
        <p><strong>${who}</strong> submitted a custom order request.</p>
        ${
          request.email
            ? `<p>Email: <a href="mailto:${request.email}">${request.email}</a></p>`
            : ""
        }
        ${request.phone ? `<p>Phone: ${request.phone}</p>` : ""}
        <p style="margin:24px 0">
          <a href="${dashHref}"
             style="background:#2E7D3F;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
            View request
          </a>
        </p>
      </div>
    `;
    try {
      await sendOwnerEmail(recipients, `[${APP_NAME}] ${title}`, html, {
        kind: "custom_order",
        replyTo: request.email ?? undefined,
      });
    } catch (error) {
      console.error(`[${APP_NAME}] custom order email failed`, error);
    }
  }

  if (pushOn) {
    await sendOwnerPush(request.ownerId, {
      title,
      body: message,
      data: { type: "custom_order", requestId: request.id },
    }).catch((error) => {
      console.error(`[${APP_NAME}] custom order push failed`, error);
    });
  }
}
