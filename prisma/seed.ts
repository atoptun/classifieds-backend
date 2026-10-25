import prisma from "@/db/prisma.ts";

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("Спочатку зареєструйтесь через POST /api/auth/register");
    return;
  }

}

try {
  await main();
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}
