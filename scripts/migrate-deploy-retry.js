const { execSync } = require("child_process");

const attempts = 3;
const delayMs = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      console.log(`prisma migrate deploy (attempt ${i}/${attempts})`);
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch (error) {
      if (i === attempts) {
        console.error("prisma migrate deploy failed after retries");
        process.exit(typeof error.status === "number" ? error.status : 1);
      }
      console.warn(
        `migrate deploy failed (often Neon advisory lock timeout). Retrying in ${delayMs / 1000}s…`,
      );
      await sleep(delayMs);
    }
  }
}

void main();
