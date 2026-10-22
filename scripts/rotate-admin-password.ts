import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password.js";

const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 16) {
  throw new Error("Set ADMIN_PASSWORD to a new password of at least 16 characters before running this command.");
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
async function main() {
  await prisma.setting.upsert({
    where: { key: "auth" },
    create: { key: "auth", valueJson: JSON.stringify({ passwordHash: hashPassword(password!) }) },
    update: { valueJson: JSON.stringify({ passwordHash: hashPassword(password!) }) },
  });
  console.log("Admin password rotated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
