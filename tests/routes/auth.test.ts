import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "@/app.ts";
import prisma from "@/db/prisma.ts";
import bcrypt from "bcrypt";
import { invalidUser, validUser } from "../data/user.ts";

describe("Auth API", () => {
  describe("POST /auth/register", () => {
    it("register a new user and return tokens", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.username).toBe(validUser.username);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("returns 409 if username is already taken", async () => {
      await prisma.user.create({
        data: {
          ...validUser,
          password: await bcrypt.hash(validUser.password, 10),
        },
      });

      const response = await request(app)
        .post("/auth/register")
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error");
    });

    it("returns 422 when data is invalid", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send(invalidUser);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          ...validUser,
          password: await bcrypt.hash(validUser.password, 10),
        },
      });
    });

    it("returns tokens when given valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: validUser.username,
        password: validUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.username).toBe(validUser.username);
    });

    it("returns 401 when given invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: "invalid_user",
        password: "wrong_password",
      });

      expect(response.status).toBe(401);
    });

    it("returns 401 when given invalid password", async () => {
      const response = await request(app).post("/auth/login").send({
        username: validUser.username,
        password: "wrong_password",
      });

      expect(response.status).toBe(401);
    });
  });
});
