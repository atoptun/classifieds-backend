import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "@/app.ts";
import prisma from "@/db/prisma.ts";
import bcrypt from "bcrypt";
import { validUser } from "../data/user.ts";

describe("Base Security", () => {
  describe("rate limit", () => {
    it("returns 429 when too many requests are made", async () => {
      for (let i = 0; i < 10; i++) {
        await request(app).post("/auth/login").send({
          username: "invalid_user",
          password: "wrong_password",
        });
      }

      const response = await request(app).post("/auth/login").send({
        username: "invalid_user",
        password: "wrong_password",
      });

      expect(response.status).toBe(429);
    });
  });

  describe("check CORS", () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          ...validUser,
          password: await bcrypt.hash(validUser.password, 10),
        },
      });
    });

    it("allows requests from allowed origins", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Origin", "http://localhost:3000")
        .send({
          username: validUser.username,
          password: validUser.password,
        });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000",
      );
    });

    it("blocks requests from disallowed origins", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("Origin", "http://disallowed-origin.com")
        .send({
          username: validUser.username,
          password: validUser.password,
        });

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });
});
