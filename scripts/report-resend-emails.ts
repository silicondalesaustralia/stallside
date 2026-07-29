/**
 * Summarize Resend sent emails (subjects + recipients only).
 * Usage: npx tsx scripts/report-resend-emails.ts
 */
import "dotenv/config";

type ResendEmail = {
  id?: string;
  to?: string | string[];
  subject?: string;
  created_at?: string;
  last_event?: string;
};

type ListResponse = {
  data?: ResendEmail[];
  has_more?: boolean;
  object?: string;
  message?: string;
  name?: string;
};

async function fetchPage(after?: string): Promise<ListResponse> {
  const url = new URL("https://api.resend.com/emails");
  url.searchParams.set("limit", "100");
  if (after) url.searchParams.set("after", after);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  const data = (await res.json()) as ListResponse;
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

function recipients(e: ResendEmail): string[] {
  if (!e.to) return [];
  return (Array.isArray(e.to) ? e.to : [e.to]).map((a) => a.toLowerCase());
}

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const all: ResendEmail[] = [];
  let after: string | undefined;
  for (let page = 0; page < 20; page += 1) {
    const data = await fetchPage(after);
    const batch = data.data ?? [];
    all.push(...batch);
    if (!data.has_more || batch.length === 0) break;
    after = batch[batch.length - 1]?.id;
    if (!after) break;
  }

  const bySubject = new Map<string, number>();
  const byTo = new Map<string, number>();

  for (const e of all) {
    const subject = e.subject || "(no subject)";
    bySubject.set(subject, (bySubject.get(subject) ?? 0) + 1);
    for (const addr of recipients(e)) {
      byTo.set(addr, (byTo.get(addr) ?? 0) + 1);
    }
  }

  console.log(`Fetched ${all.length} email(s) from Resend\n`);

  console.log("=== Subjects ===");
  [...bySubject.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([s, n]) => console.log(`  ${String(n).padStart(3)}  ${s}`));

  console.log("\n=== Per recipient ===");
  [...byTo.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([addr, n]) => console.log(`  ${String(n).padStart(3)}  ${addr}`));

  console.log("\n=== Log (created | event | to | subject) ===");
  for (const e of all) {
    for (const addr of recipients(e)) {
      console.log(
        `${e.created_at ?? "?"}  |  ${String(e.last_event ?? "").padEnd(12)}  |  ${addr}  |  ${e.subject ?? ""}`,
      );
    }
  }

  // Lifecycle / marketing-ish subjects (exclude OTP codes)
  const otpish = /is your .+ code$/i;
  const lifecycleish = all.filter((e) => !otpish.test(e.subject ?? ""));
  console.log(`\nNon-OTP emails: ${lifecycleish.length}`);
  const otpCount = all.length - lifecycleish.length;
  console.log(`OTP-style emails: ${otpCount}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
