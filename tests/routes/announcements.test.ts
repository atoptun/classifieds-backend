import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "@/app.ts";
import prisma from "@/db/prisma.ts";
import cloudinary from "@/services/cloudinary.service.ts";
import { validAnnouncement } from "../data/announcements.ts";
import { createAuthUser } from "../helpers/auth.ts";
import { resolve } from "node:path";

describe("Announcements API", () => {
  describe("GET /announcements", () => {
    it("returns an empty list of announcements with pagination", async () => {
      const response = await request(app).get("/announcements");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("total", 0);
      expect(response.body.pagination).toHaveProperty("page", 1);
      expect(response.body.pagination).toHaveProperty("totalPages", 0);
      expect(response.body.pagination).toHaveProperty("perPage", 10);
    });
  });

  describe("POST /announcements", () => {
    let accessToken: string;

    beforeEach(async () => {
      accessToken = (await createAuthUser()).accessToken;
    });

    it("creates an announcement without an image", async () => {
      const response = await request(app)
        .post("/announcements")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validAnnouncement);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: validAnnouncement.title,
        description: validAnnouncement.description,
        category: validAnnouncement.category.toUpperCase(),
        imageUrl: null,
      });
    });

    it("creates an announcement with an image use mock Cloudinary", async () => {
      const mockImageUrl =
        "https://res.cloudinary.com/demo/image/upload/v1/announcements/test.jpg";

      const uploadSpy = vi
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValue({
          secure_url: mockImageUrl,
          public_id: "announcements/test",
        } as never);

      const response = await request(app)
        .post("/announcements")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", validAnnouncement.title)
        .field("description", validAnnouncement.description)
        .field("price", String(validAnnouncement.price))
        .field("category", validAnnouncement.category)
        .attach("image", Buffer.from("fake-image-bytes"), {
          filename: "test.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(uploadSpy).toHaveBeenCalledOnce();
      expect(response.body.imageUrl).toBe(mockImageUrl);

      uploadSpy.mockRestore();
    });
  });

  describe("PATCH /announcements/:id", () => {
    let accessToken: string;
    let announcementId: number;

    beforeEach(async () => {
      const { user, accessToken: token } = await createAuthUser();
      accessToken = token;

      const created = await prisma.announcement.create({
        data: {
          title: validAnnouncement.title,
          description: validAnnouncement.description,
          price: validAnnouncement.price,
          category: "SALE",
          userId: user.id,
        },
      });

      announcementId = created.id;
    });

    it("updates an announcement without an image", async () => {
      const updatedFields = {
        title: "Updated Title",
        price: 1500.5,
      };

      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatedFields);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: announcementId,
        title: updatedFields.title,
        description: validAnnouncement.description,
        price: "1500.5",
        imageUrl: null,
      });
    });

    it("updates an announcement with an image using mock Cloudinary", async () => {
      const mockImageUrl =
        "https://res.cloudinary.com/demo/image/upload/v1/announcements/updated.jpg";

      const uploadSpy = vi
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValue({
          secure_url: mockImageUrl,
          public_id: "announcements/updated",
        } as never);

      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "Updated With Image")
        .attach("image", Buffer.from("fake-image-bytes"), {
          filename: "updated.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(200);
      expect(uploadSpy).toHaveBeenCalledOnce();
      expect(response.body).toMatchObject({
        id: announcementId,
        title: "Updated With Image",
        imageUrl: mockImageUrl,
      });

      uploadSpy.mockRestore();
    });

    it("replaces an existing image and deletes the old image from Cloudinary", async () => {
      await prisma.announcement.update({
        where: { id: announcementId },
        data: {
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/announcements/old.jpg",
          imageId: "announcements/old",
        },
      });

      const newMockImageUrl =
        "https://res.cloudinary.com/demo/image/upload/v1/announcements/new.jpg";

      const uploadSpy = vi
        .spyOn(cloudinary.uploader, "upload")
        .mockResolvedValue({
          secure_url: newMockImageUrl,
          public_id: "announcements/new",
        } as never);

      const destroySpy = vi
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" } as never);

      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "Replaced Image Title")
        .attach("image", Buffer.from("new-fake-image-bytes"), {
          filename: "new.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(200);
      expect(uploadSpy).toHaveBeenCalledOnce();
      expect(destroySpy).toHaveBeenCalledWith("announcements/old");
      expect(response.body.imageUrl).toBe(newMockImageUrl);

      uploadSpy.mockRestore();
      destroySpy.mockRestore();
    });
  });

  describe("DELETE /announcements/:id", () => {
    let accessToken: string;
    let announcementId: number;

    beforeEach(async () => {
      const { user, accessToken: token } = await createAuthUser();
      accessToken = token;

      const created = await prisma.announcement.create({
        data: {
          title: validAnnouncement.title,
          description: validAnnouncement.description,
          price: validAnnouncement.price,
          category: "SALE",
          userId: user.id,
        },
      });

      announcementId = created.id;
    });

    it("deletes an announcement without an image", async () => {
      const destroySpy = vi
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" } as never);

      const response = await request(app)
        .delete(`/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      const deleted = await prisma.announcement.findUnique({
        where: { id: announcementId },
      });
      expect(deleted).toBeNull();

      expect(destroySpy).not.toHaveBeenCalled();

      destroySpy.mockRestore();
    });

    it("deletes an announcement with an image, mock Cloudinary", async () => {
      await prisma.announcement.update({
        where: { id: announcementId },
        data: {
          imageUrl:
            "https://res.cloudinary.com/demo/image/upload/v1/announcements/to-delete.jpg",
          imageId: "announcements/to-delete",
        },
      });

      const destroySpy = vi
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" } as never);

      const response = await request(app)
        .delete(`/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      const deleted = await prisma.announcement.findUnique({
        where: { id: announcementId },
      });
      expect(deleted).toBeNull();

      expect(destroySpy).toHaveBeenCalledWith("announcements/to-delete");

      destroySpy.mockRestore();
    });
  });

  describe.skip("use real Cloudinary just for DEBUG", () => {
    let accessToken: string;

    beforeEach(async () => {
      accessToken = (await createAuthUser()).accessToken;
    });

    it("creates, updates, and deletes an announcement with a real image uploaded to Cloudinary", async () => {
      const imagePath = resolve("tests/data/binary/capybara.png");
      const imageUpdatePath = resolve("tests/data/binary/capybara-2.png");

      const response = await request(app)
        .post("/announcements")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", validAnnouncement.title)
        .field("description", validAnnouncement.description)
        .field("price", String(validAnnouncement.price))
        .field("category", validAnnouncement.category)
        .attach("image", imagePath);

      expect(response.status).toBe(201);
      expect(response.body.imageUrl).toEqual(
        expect.stringContaining("https://res.cloudinary.com/"),
      );

      // Check if the imageId is stored in the database
      const created = await prisma.announcement.findUnique({
        where: { id: response.body.id },
        select: { imageId: true },
      });

      expect(created).not.toBeNull();
      expect(created?.imageId).toBeDefined();

      // Update the announcement with a new image
      const updateResponse = await request(app)
        .patch(`/announcements/${response.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "Updated Title with New Image")
        .attach("image", imageUpdatePath);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.imageUrl).toEqual(
        expect.stringContaining("https://res.cloudinary.com/"),
      );

      // Check if the old imageId is removed from Cloudinary by trying to destroy it (should return an error)
      const destroyFirstResponse = await cloudinary.uploader.destroy(
        created!.imageId!,
      );

      expect(destroyFirstResponse.result).toBe("not found");

      // Delete the announcement and check if the image is removed from Cloudinary
      const deleteResponse = await request(app)
        .delete(`/announcements/${response.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(204);

      // Check if the imageId is removed from Cloudinary by trying to destroy it again (should return an error)
      const destroyResponse = await cloudinary.uploader.destroy(
        created!.imageId!,
      );

      expect(destroyResponse.result).toBe("not found");
    });
  });
});
