import { errorResponse, jsonBody, jsonResponse } from "./helper.ts";
import {
  AuthResponseSchema,
  LoginSchema,
  PublicUserSchema,
  RefreshTokenSchema,
  RegisterSchema,
  TokensResponseSchema,
} from "@/validators/auth.validator.ts";
import { registry } from "./registry.ts";

registry.registerPath({
  method: "post",
  path: "/auth/register",
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
  path: "/auth/login",
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
  path: "/auth/refresh",
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
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout user",
  security: [{ bearerAuth: [] }],
  responses: {
    204: jsonResponse("Logged out successfully"),
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Return user information",
  security: [{ bearerAuth: [] }],
  responses: {
    200: jsonResponse("User information", PublicUserSchema),
    401: errorResponse("Authentication required"),
    404: errorResponse("User not found"),
  },
});
