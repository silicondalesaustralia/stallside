const { execSync } = require("child_process");

const attempts = 3;
const delayMs = 5000;
const FAILED_CUSTOMERS_MIGRATION = "20260922180000_customers_and_communication";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksPooled(url) {
  if (!url) return false;
  return /[-.]pooler\.|pgbouncer=true|pooling=true/i.test(url);
}

function runMigrate(env) {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
}

function clearFailedCustomersMigration(env) {
  console.warn(
    `Clearing failed migration ${FAILED_CUSTOMERS_MIGRATION} (if present) so idempotent SQL can re-apply…`,
  );
  try {
    execSync(
      `npx prisma migrate resolve --rolled-back ${FAILED_CUSTOMERS_MIGRATION}`,
      { stdio: "inherit", env },
    );
    return true;
  } catch {
    // No failed row for this migration — ignore.
    return false;
  }
}

async function main() {
  const migrateUrl =
    process.env.DIRECT_DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL;

  if (looksPooled(migrateUrl) && !process.env.DIRECT_DATABASE_URL) {
    console.warn(
      "DATABASE_URL looks pooled (Neon pooler). Prefer DIRECT_DATABASE_URL for migrations.",
    );
  }

  // Neon pooler + session advisory locks = P1002. Safe while Vercel runs one migrate at a time.
  const env = {
    ...process.env,
    PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
  };

  let triedClear = false;

  for (let i = 1; i <= attempts; i += 1) {
    try {
      console.log(`prisma migrate deploy (attempt ${i}/${attempts})`);
      runMigrate(env);
      return;
    } catch (error) {
      if (!triedClear) {
        triedClear = true;
        clearFailedCustomersMigration(env);
        try {
          console.log("prisma migrate deploy (after clearing failed migration)");
          runMigrate(env);
          return;
        } catch {
          // continue normal retries
        }
      }

      if (i === attempts) {
        console.error("prisma migrate deploy failed after retries");
        process.exit(typeof error.status === "number" ? error.status : 1);
      }
      console.warn(`migrate deploy failed. Retrying in ${delayMs / 1000}s…`);
      await sleep(delayMs);
    }
  }
}

void main();
