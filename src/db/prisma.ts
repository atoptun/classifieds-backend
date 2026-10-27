import { PrismaPg } from "@prisma/adapter-pg";
import env from "@/config/env.ts";
import { PrismaClient } from "@db/client";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
