import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import { HOME_EYEBROW, HOME_HEADING_FONT, HOME_TEXT_LINK } from "@/components/home/home-styles";
import { safeCallbackUrl } from "@/lib/login-callback";
import LoginCodeForm from "./LoginCodeForm";

export default async function LoginCodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const email = (params.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/login");
  }
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[22px] py-16">
        <BrandLockup size="md" />
        <p className={`${HOME_EYEBROW} mb-3 mt-10`}>CHECK YOUR EMAIL</p>
        <h1 className={`${HOME_HEADING_FONT} text-[40px] leading-[1.05] text-[var(--field)] sm:text-[48px]`}>
          Enter your code
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--muted)]">
          We emailed a 6-digit code to <strong className="text-[var(--field)]">{email}</strong>. Stay in this
          app - type it in here.
        </p>
        <LoginCodeForm email={email} callbackUrl={callbackUrl} />
        <p className="mt-6 text-sm">
          <Link href="/login" className={HOME_TEXT_LINK}>
            Use a different email
          </Link>
        </p>
      </main>
    </div>
  );
}
