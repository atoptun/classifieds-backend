import { z } from "zod";
import { registry } from "@/openapi.ts";
import { errorResponse, jsonBody, jsonResponse } from "./helper.ts";
import { User } from "@db/client";

export const RegisterSchema = registry.register(
  "Register",
  z.object({
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .openapi({ example: "john_doe" }),
    email: z.email().openapi({ example: "john@examle.com" }),
    password: z.string().min(6).openapi({ example: "password" }),
    name: z.string().min(2).max(255).openapi({ example: "John Doe" }),
  }),
);

export const LoginSchema = registry.register(
  "Login",
  z.object({
    username: z.string().openapi({ example: "john_doe" }),
    password: z.string().openapi({ example: "password" }),
  }),
);

export const RefreshTokenSchema = registry.register(
  "RefreshToken",
  z.object({
    refreshToken: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
  }),
);

export const PublicUserSchema = registry.register(
  "PublicUser",
  z.object({
    id: z.number().int().positive().openapi({ example: 1 }),
    username: z.string().openapi({ example: "john_doe" }),
    email: z.email().openapi({ example: "john@examle.com" }),
    name: z.string().openapi({ example: "John Doe" }),
    createdAt: z.date().openapi({ example: "2026-01-01T12:00:00.000Z" }),
  }) satisfies z.ZodType<Omit<User, "password">>,
);

export const TokensResponseSchema = registry.register(
  "TokensResponse",
  z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
    refreshToken: z.string().openapi({ example: "a1b2c3d4e5f6..." }),
  }),
);

export const AuthResponseSchema = registry.register(
  "AuthResponse",
  TokensResponseSchema.extend({
    user: PublicUserSchema,
  }),
);

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshTokenBody = z.infer<typeof RefreshTokenSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type TokensResponse = z.infer<typeof TokensResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: jsonBody(RegisterSchema),
  },
  responses: {
    201: jsonResponse("User registered successfully", AuthResponseSchema),
    409: errorResponse("Username or email already taken"),
    422: errorResponse("Validation error"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login user",
  request: {
    body: jsonBody(LoginSchema),
  },
  responses: {
    200: jsonResponse("Login successful", AuthResponseSchema),
    401: errorResponse("Invalid credentials"),
    422: errorResponse("Validation error"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh token pair",
  request: {
    body: jsonBody(RefreshTokenSchema),
  },
  responses: {
    200: jsonResponse("Tokens refreshed successfully", TokensResponseSchema),
    401: errorResponse("Invalid or expired refresh token"),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Logout user",
  request: {
    body: jsonBody(RefreshTokenSchema),
  },
  responses: {
    204: jsonResponse("Logged out successfully"),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Return user information",
  security: [{ bearerAuth: [] }],
  responses: {
    200: jsonResponse("User information", PublicUserSchema),
    401: errorResponse("Authentication required"),
    404: errorResponse("User not found"),
  },
});
