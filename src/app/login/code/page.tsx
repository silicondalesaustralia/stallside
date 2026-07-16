import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
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
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <BrandLockup />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
        Enter your code
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        We emailed a 6-digit code to <strong>{email}</strong>. Stay in this app —
        type it in here.
      </p>
      <LoginCodeForm email={email} callbackUrl={callbackUrl} />
      <Link href="/login" className="mt-6 text-sm font-medium text-[var(--leaf-dark)] underline">
        Use a different email
      </Link>
    </main>
  );
}
