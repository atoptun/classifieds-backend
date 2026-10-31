import { Router } from "express";
import prisma from "@/db/prisma.ts";
import authenticate from "@/middleware/authenticate.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middleware/validate.ts";
import {
  AnnouncementParamsSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAnnouncementSchema,
} from "@/validators/announcements.validator.ts";
import { AnnouncementsService } from "@/services/announcements.service.ts";
import { AnnouncementsController } from "@/controllers/announcements.controller.ts";
import { uploadSingle } from "@/middleware/upload.ts";

const service = new AnnouncementsService(prisma);
const controller = new AnnouncementsController(service);

const router = Router();

router.get(
  "/",
  validateQuery(GetAnnouncementsQuerySchema),
  controller.listAllAnnouncements,
);

router.get(
  "/:id",
  validateParams(AnnouncementParamsSchema),
  controller.getAnnouncementById,
);

router.post(
  "/",
  authenticate,
  uploadSingle("image"),
  validateBody(CreateAnnouncementSchema),
  controller.createAnnouncement,
);

router.patch(
  "/:id",
  authenticate,
  validateParams(AnnouncementParamsSchema),
  uploadSingle("image"),
  validateBody(UpdateAnnouncementSchema),
  controller.updateAnnouncement,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(AnnouncementParamsSchema),
  controller.deleteAnnouncement,
);

export default router;
