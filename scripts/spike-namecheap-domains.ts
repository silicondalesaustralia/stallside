/**
 * Namecheap Sandbox spike — non-destructive by default.
 *
 *   npx tsx scripts/spike-namecheap-domains.ts
 */
import "dotenv/config";
import {
  namecheapApiUrl,
  namecheapConfigured,
  namecheapEnvironment,
} from "../src/lib/domains/registrar/namecheap/config";
import { NamecheapApiError } from "../src/lib/domains/registrar/namecheap/client";
import {
  createNamecheapRegistrar,
  namecheapListTlds,
} from "../src/lib/domains/registrar/namecheap/provider";

type Row = { check: string; status: "PASS" | "FAIL" | "SKIP"; detail?: string };

/** Launch TLDs — `.au` direct is out of scope. */
const PROBES = [
  "greenvalleyfarm.com.au",
  "greenvalleyfarm.com",
  "greenvalleyfarm.net.au",
] as const;

async function main() {
  const rows: Row[] = [];
  const env = namecheapEnvironment();

  rows.push({
    check: "Namecheap credentials",
    status: namecheapConfigured() ? "PASS" : "FAIL",
  });
  rows.push({
    check: "Environment",
    status: env === "sandbox" ? "PASS" : "FAIL",
    detail: `${env} → ${namecheapApiUrl()}`,
  });

  if (!namecheapConfigured()) {
    finish(rows, "NAMECHEAP REGISTRAR SPIKE NEEDS WORK");
    return;
  }

  const registrar = createNamecheapRegistrar();

  try {
    const sample = await registrar.checkAvailability("example.com");
    rows.push({
      check: "API connectivity",
      status: "PASS",
      detail: `example.com available=${sample.available}`,
    });
  } catch (err) {
    rows.push({
      check: "API connectivity",
      status: "FAIL",
      detail: summarize(err),
    });
    finish(rows, "NAMECHEAP REGISTRAR SPIKE NEEDS WORK");
    return;
  }

  for (const domain of PROBES) {
    const tld = domain.slice(domain.indexOf(".") + 1);
    try {
      const avail = await registrar.checkAvailability(domain);
      rows.push({
        check: `.${tld} availability`,
        status: "PASS",
        detail: `available=${avail.available} premium=${Boolean(avail.premium)}`,
      });
    } catch (err) {
      rows.push({
        check: `.${tld} availability`,
        status: "FAIL",
        detail: summarize(err),
      });
    }
  }

  try {
    const tlds = await namecheapListTlds();
    const need = ["com.au", "com", "net.au"];
    const missing = need.filter((t) => !tlds.includes(t));
    rows.push({
      check: "TLD list support",
      status: missing.length ? "FAIL" : "PASS",
      detail: missing.length
        ? `missing: ${missing.join(", ")}`
        : `has ${need.join(", ")} (${tlds.length} TLDs)`,
    });
    rows.push({
      check: ".au direct",
      status: "SKIP",
      detail: "Out of scope — not offered in Vendl Buy a Domain",
    });
  } catch (err) {
    rows.push({
      check: "TLD list support",
      status: "FAIL",
      detail: summarize(err),
    });
  }

  for (const tld of ["com.au", "com", "net.au"]) {
    const domain = `spikeprobe.${tld}`;
    try {
      const reg = await registrar.getRegistrationPrice(domain, 1);
      const ren = await registrar.getRenewalPrice(domain, 1);
      rows.push({
        check: `.${tld} pricing`,
        status: "PASS",
        detail: `reg=${reg.currencyCode} ${(reg.value / 100).toFixed(2)} renew=${(ren.value / 100).toFixed(2)}`,
      });
    } catch (err) {
      rows.push({
        check: `.${tld} pricing`,
        status: "FAIL",
        detail: summarize(err),
      });
    }
  }

  rows.push({
    check: "Customer registrant contacts",
    status: "SKIP",
    detail: "Requires domains.create — not run in read-only spike",
  });
  rows.push({
    check: ".com.au extended attributes",
    status: "SKIP",
    detail: "Documented on create; prove on approved sandbox register later",
  });
  rows.push({
    check: "Stable egress IPv4 for Vercel",
    status: "SKIP",
    detail: "Infra follow-up — local ClientIp only for this spike",
  });

  const failed = rows.filter((r) => r.status === "FAIL");
  const gate =
    failed.length === 0
      ? "NAMECHEAP REGISTRAR SPIKE PARTIAL PASS (read path)"
      : "NAMECHEAP REGISTRAR SPIKE NEEDS WORK";
  finish(rows, gate);
}

function finish(rows: Row[], gate: string) {
  console.log(JSON.stringify({ at: new Date().toISOString(), gate, rows }, null, 2));
  for (const r of rows) {
    console.log(
      `${r.status.padEnd(4)} ${r.check}${r.detail ? ` — ${r.detail}` : ""}`,
    );
  }
  process.exit(rows.some((r) => r.status === "FAIL") ? 1 : 0);
}

function summarize(err: unknown): string {
  if (err instanceof NamecheapApiError) {
    return `${err.status}: ${err.message}`.slice(0, 200);
  }
  if (err instanceof Error) return err.message.slice(0, 200);
  return String(err).slice(0, 200);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
