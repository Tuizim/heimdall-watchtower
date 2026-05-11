import "dotenv/config";
// @ts-ignore — defineConfig types in Prisma 7.8 don't expose all fields yet
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
});
