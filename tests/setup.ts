import { beforeEach, afterAll } from "vitest";
import prisma from "@/db/prisma.ts";
import { cleanDatabase } from "./helpers/db.ts";

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});
