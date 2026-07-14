const { execSync } = require("child_process");

const attempts = 3;
const delayMs = 5000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksPooled(url) {
  if (!url) return false;
  return /[-.]pooler\.|pgbouncer=true|pooling=true/i.test(url);
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

  for (let i = 1; i <= attempts; i += 1) {
    try {
      console.log(`prisma migrate deploy (attempt ${i}/${attempts})`);
      execSync("npx prisma migrate deploy", { stdio: "inherit", env });
      return;
    } catch (error) {
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
