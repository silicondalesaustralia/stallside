import type { FooterContact } from "@/lib/studio/footer-view";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{6,}$/;

/** Address, phone, email and hours typed by the seller into a footer column. */
export default function StudioFooterContact({ contact }: { contact: FooterContact }) {
  const address = contact.address?.trim();
  const phone = contact.phone?.trim();
  const email = contact.email?.trim();
  const hours = contact.hours?.trim();

  return (
    <div className="mt-3 space-y-2 text-sm">
      {address ? <address className="whitespace-pre-line not-italic leading-relaxed opacity-90">{address}</address> : null}
      {phone ? (
        <p>
          {PHONE.test(phone) ? (
            <a href={`tel:${phone.replace(/[\s()-]/g, "")}`} className="font-medium hover:underline">
              {phone}
            </a>
          ) : (
            phone
          )}
        </p>
      ) : null}
      {email ? (
        <p>
          {EMAIL.test(email) ? (
            <a href={`mailto:${email}`} className="font-medium hover:underline">
              {email}
            </a>
          ) : (
            email
          )}
        </p>
      ) : null}
      {hours ? <p className="whitespace-pre-line leading-relaxed opacity-80">{hours}</p> : null}
    </div>
  );
}
