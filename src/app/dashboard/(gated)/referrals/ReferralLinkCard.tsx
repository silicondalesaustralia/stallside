import InviteCopyLink from "@/components/InviteCopyLink";

export default function ReferralLinkCard({ url }: { url: string }) {
  return (
    <section className="dash-card p-5">
      <h2 className="font-semibold text-[var(--field)]">Your referral link</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Anyone who signs up within 90 days of clicking this link is linked to you.
      </p>
      <InviteCopyLink url={url} />
    </section>
  );
}
