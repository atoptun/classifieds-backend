import prisma from "@/db/prisma.ts";
import { AuthService } from "@/services/auth.service.ts";

const authService = new AuthService(prisma);

export async function createAuthUser(
  overrides: Partial<{
    username: string;
    email: string;
    name: string;
  }> = {},
) {
  const user = await prisma.user.create({
    data: {
      username: overrides.username ?? "testuser",
      email: overrides.email ?? "test@example.com",
      password: "fake_hash_not_used_in_tests",
      name: overrides.name ?? "Test User",
    },
  });

  const { accessToken } = await authService.createTokens(user.id);

  return { user, accessToken };
}
