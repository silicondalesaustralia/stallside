import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { submitCustomOrderRequest } from "./actions";

export default async function PublicCustomOrderFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ thanks?: string }>;
}) {
  const { formId } = await params;
  const { thanks } = await searchParams;

  const form = await prisma.customOrderForm.findFirst({
    where: { id: formId, isPublished: true },
    include: { fields: { orderBy: { sortOrder: "asc" } }, owner: { select: { businessName: true } } },
  });
  if (!form) notFound();

  if (thanks) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-4 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Thank you</h1>
        <p className="text-[var(--muted)]">
          {form.thankYouNote ||
            "We've received your request and will be in touch soon."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <div>
        <p className="text-sm text-[var(--muted)]">
          {form.owner.businessName}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {form.title}
        </h1>
        {form.description ? (
          <p className="mt-2 text-[var(--muted)]">{form.description}</p>
        ) : null}
      </div>

      <form action={submitCustomOrderRequest} className="flex flex-col gap-4">
        <input type="hidden" name="formId" value={form.id} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Your name</span>
          <input
            name="customerName"
            required
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Phone</span>
          <input
            name="phone"
            type="tel"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        {form.fields.map((field) => (
          <label key={field.id} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.fieldType === "TEXTAREA" ? (
              <textarea
                name={`field_${field.id}`}
                required={field.required}
                rows={3}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              />
            ) : (
              <input
                name={`field_${field.id}`}
                required={field.required}
                type={
                  field.fieldType === "NUMBER"
                    ? "number"
                    : field.fieldType === "DATE"
                      ? "date"
                      : field.fieldType === "EMAIL"
                        ? "email"
                        : field.fieldType === "PHONE"
                          ? "tel"
                          : "text"
                }
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              />
            )}
          </label>
        ))}
        <button type="submit" className={dashCtaClass}>
          Submit request
        </button>
      </form>
    </main>
  );
}
