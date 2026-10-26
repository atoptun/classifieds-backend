import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import prisma from "@/db/prisma.ts";
import { AnnouncementCategory } from "@db/client";

async function main() {
  // 1. Clean existing data (cascades to announcements & refreshTokens)
  await prisma.user.deleteMany();

  // 2. Hash password once for all seeded users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create 1 predictable test user + 4 random users
  const users = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.create({
        data: {
          username:
            i === 0
              ? "john_doe"
              : faker.internet
                  .username()
                  .replace(/[^a-zA-Z0-9_]/g, "_")
                  .slice(0, 30),
          email: i === 0 ? "john@example.com" : faker.internet.email(),
          name: i === 0 ? "John Doe" : faker.person.fullName(),
          password: hashedPassword,
        },
      }),
    ),
  );

  // 4. Bulk-create 30 fake announcements across those users
  await prisma.announcement.createMany({
    data: Array.from({ length: 30 }, () => ({
      userId: faker.helpers.arrayElement(users).id,
      title: faker.commerce.productName().slice(0, 50),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price({ min: 5, max: 5000, dec: 2 }),
      category: faker.helpers.enumValue(AnnouncementCategory),
      createdAt: faker.date.recent({ days: 30 }),
    })),
  });

  console.log("Seeded 5 users and 30 announcements");
}

try {
  await main();
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}
