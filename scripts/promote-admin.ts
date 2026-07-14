import "dotenv/config";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run admin:promote -- you@example.com");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN },
      });
      console.log(`Promoted existing user ${email} to ADMIN.`);
    } else {
      const user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0] ?? "Admin",
          role: Role.ADMIN,
          emailVerified: new Date(),
        },
      });
      await prisma.owner.create({
        data: {
          userId: user.id,
          businessName: "Stallside Platform",
          contactEmail: email,
        },
      });
      console.log(`Created ADMIN user ${email} (plus owner profile for dashboard access).`);
    }

    console.log("Sign in at /login with that email, then open /admin.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
