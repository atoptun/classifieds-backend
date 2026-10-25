import { z } from "zod";
import { User } from "@db/client";

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .openapi({ example: "john_doe" }),
    email: z.email().openapi({ example: "john@examle.com" }),
    password: z.string().min(6).openapi({ example: "password" }),
    name: z.string().min(2).max(255).openapi({ example: "John Doe" }),
  })
  .openapi("Register");

export const LoginSchema = z
  .object({
    username: z.string().openapi({ example: "john_doe" }),
    password: z.string().openapi({ example: "password" }),
  })
  .openapi("Login");

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
  })
  .openapi("RefreshToken");

export const PublicUserSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    username: z.string().openapi({ example: "john_doe" }),
    email: z.email().openapi({ example: "john@examle.com" }),
    name: z.string().openapi({ example: "John Doe" }),
    createdAt: z.date().openapi({ example: "2026-01-01T12:00:00.000Z" }),
  })
  .openapi("User") satisfies z.ZodType<Omit<User, "password">>;

export const TokensResponseSchema = z
  .object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
    refreshToken: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
  })
  .openapi("TokensResponse");

export const AuthResponseSchema = TokensResponseSchema.extend({
  user: PublicUserSchema,
}).openapi("AuthResponse");

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshTokenBody = z.infer<typeof RefreshTokenSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type TokensResponse = z.infer<typeof TokensResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
