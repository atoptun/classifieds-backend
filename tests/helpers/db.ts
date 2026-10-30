import prisma from "@/db/prisma.ts";

export async function cleanDatabase() {
  await prisma.announcement.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}
