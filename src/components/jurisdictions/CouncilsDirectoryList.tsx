import type { CouncilDirectoryFile, CouncilRecord } from "@/lib/jurisdictions";
import {
  formatCouncilAddress,
  primaryCouncilActionUrl,
} from "@/lib/jurisdictions";

const REGION_LABEL: Record<CouncilRecord["region"], string> = {
  metropolitan: "Metropolitan",
  regional: "Regional",
  outback: "Remote and Aboriginal lands",
};

function statusLabel(c: CouncilRecord): string {
  if (c.enforcement_agency) return `via ${c.enforcement_agency}`;
  if (c.notification_form_url) {
    const blob = `${c.notification_form_url} ${c.notes}`.toLowerCase();
    if (/licen[cs]e|apply-for-a-food/.test(blob)) return "Licence application";
    return "Notification form";
  }
  if (c.food_business_page) return "Food business page";
  if (c.website) return "Council website";
  return "Link pending";
}

function CouncilRow({
  council,
  jurisdictionCode,
}: {
  council: CouncilRecord;
  jurisdictionCode: string;
}) {
  const href = primaryCouncilActionUrl(council);
  const address = formatCouncilAddress(council, jurisdictionCode);
  const foodPhone = council.eho_phone || council.phone;
  const foodEmail = council.eho_email || council.email;

  return (
    <li className="border-t border-[var(--border)] py-4 first:border-t-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {href ? (
            <a
              href={href}
              className="font-medium text-[var(--field)] underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              {council.name}
            </a>
          ) : (
            <span className="font-medium text-[var(--field)]">{council.name}</span>
          )}

          {council.enforcement_agency ? (
            <p className="mt-1 text-sm text-[var(--field)] leading-snug">
              Notify{" "}
              {council.enforcement_agency_url ? (
                <a
                  href={council.enforcement_agency_url}
                  className="underline underline-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {council.enforcement_agency}
                </a>
              ) : (
                council.enforcement_agency
              )}{" "}
              for Food Business Notification.
            </p>
          ) : null}

          {address ? (
            <p className="mt-1 text-sm text-[var(--muted)] leading-snug">
              {address}
            </p>
          ) : null}

          {(foodPhone || foodEmail) && (
            <p className="mt-1 text-sm text-[var(--muted)] leading-snug">
              {foodPhone ? (
                <>
                  <a href={`tel:${foodPhone.replace(/\s/g, "")}`}>{foodPhone}</a>
                  {foodEmail ? " · " : null}
                </>
              ) : null}
              {foodEmail ? (
                <a href={`mailto:${foodEmail}`} className="break-all">
                  {foodEmail}
                </a>
              ) : null}
            </p>
          )}

          {council.notes ? (
            <p className="mt-1 text-sm text-[var(--muted)] leading-snug">
              {council.notes}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm text-[var(--muted)]">{statusLabel(council)}</p>
      </div>
    </li>
  );
}

export default function CouncilsDirectoryList({
  directory,
}: {
  directory: CouncilDirectoryFile;
}) {
  const byRegion: CouncilRecord["region"][] = [
    "metropolitan",
    "regional",
    "outback",
  ];

  return (
    <div className="mt-10 space-y-10">
      {byRegion.map((region) => {
        const rows = directory.councils.filter((c) => c.region === region);
        if (!rows.length) return null;
        return (
          <section key={region}>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
              {REGION_LABEL[region]}
            </h2>
            <ul className="mt-3">
              {rows.map((c) => (
                <CouncilRow
                  key={c.slug}
                  council={c}
                  jurisdictionCode={directory.jurisdiction_code}
                />
              ))}
            </ul>
          </section>
        );
      })}

      <section className="border border-[var(--border)] p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          {directory.unincorporated.label}
        </h2>
        <p className="mt-2 text-sm text-[var(--field)] leading-relaxed">
          {directory.unincorporated.notes} Regulator:{" "}
          {directory.unincorporated.regulator}.
        </p>
        <p className="mt-2 text-sm">
          <a
            href={directory.unincorporated.form_hint_url}
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            {directory.unincorporated.regulator} guidance
          </a>
        </p>
      </section>
    </div>
  );
}
