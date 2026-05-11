import "dotenv/config";
// @ts-ignore — defineConfig types in Prisma 7.8 don't expose all fields yet
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    adapter: () => new PrismaPg(process.env.DATABASE_URL!),
  },
});
