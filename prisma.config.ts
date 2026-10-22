import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI operations use Neon's direct connection. The application runtime
  // continues to use the pooled DATABASE_URL through the PostgreSQL adapter.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
