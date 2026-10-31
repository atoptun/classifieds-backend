import { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import {
  AnnouncementsService,
  CreateAnnouncementBodyService,
  UpdateAnnouncementBodyService,
} from "@/services/announcements.service.ts";
import cloudinary from "@/services/cloudinary.service.ts";
import {
  AnnouncementParams,
  CreateAnnouncementBody,
  GetAnnouncementsQuery,
  UpdateAnnouncementBody,
} from "@/validators/announcements.validator.ts";

export class AnnouncementsController {
  constructor(private service: AnnouncementsService) {}

  listAllAnnouncements = async (
    _req: Request,
    res: Response<{}, { query: GetAnnouncementsQuery }>,
  ) => {
    const result = await this.service.listAll(res.locals.query);

    res.status(200).json(result);
  };

  getAnnouncementById = async (
    req: Request<AnnouncementParams>,
    res: Response,
  ) => {
    const result = await this.service.getById(req.params.id);

    res.status(200).json(result);
  };

  createAnnouncement = async (
    req: Request<{}, {}, CreateAnnouncementBody>,
    res: Response,
  ) => {
    req.log.debug(
      `Creating announcement: ${JSON.stringify(req.body)} by User ID ${req.user!.sub}`,
    );

    const body: CreateAnnouncementBodyService = {
      ...req.body,
      imageUrl: null,
      imageId: null,
    };

    if (req.file) {
      const imageData = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });

      body.imageUrl = imageData.secure_url;
      body.imageId = imageData.public_id;

      await unlink(req.file.path).catch((err) => {
        req.log.error(
          `Failed to delete temporary file: ${req.file?.path}`,
          err,
        );
      });
    }

    const result = await this.service.create(body, Number(req.user!.sub));

    req.log.info(
      `Announcement created: ID ${result.id} by User ID ${req.user!.sub}`,
    );

    res.status(201).json(result);
  };

  updateAnnouncement = async (
    req: Request<AnnouncementParams, {}, UpdateAnnouncementBody>,
    res: Response,
  ) => {
    req.log.debug(
      `Updating announcement ID ${req.params.id}: ${JSON.stringify(req.body)} by User ID ${req.user!.sub}`,
    );

    const body: UpdateAnnouncementBodyService = {
      ...req.body,
    };

    if (req.file) {
      const imageData = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });

      body.imageUrl = imageData.secure_url;
      body.imageId = imageData.public_id;

      await unlink(req.file.path).catch((err) => {
        req.log.error(
          `Failed to delete temporary file: ${req.file?.path}`,
          err,
        );
      });
    }

    const { updated, oldImageId } = await this.service.update(
      req.params.id,
      body,
      Number(req.user!.sub),
    );

    if (req.file && oldImageId) {
      await cloudinary.uploader.destroy(oldImageId);
    }

    req.log.info(
      `Announcement updated: ID ${req.params.id} by User ID ${req.user!.sub}`,
    );

    res.status(200).json(updated);
  };

  deleteAnnouncement = async (
    req: Request<AnnouncementParams>,
    res: Response,
  ) => {
    req.log.debug(
      `Deleting announcement ID ${req.params.id} by User ID ${req.user!.sub}`,
    );

    const { oldImageId } = await this.service.delete(
      req.params.id,
      Number(req.user!.sub),
    );

    if (oldImageId) {
      req.log.debug(
        `Deleting image from Cloudinary for announcement ID ${req.params.id}: ${oldImageId}`,
      );
      await cloudinary.uploader.destroy(oldImageId);
    }

    req.log.info(
      `Announcement deleted: ID ${req.params.id} by User ID ${req.user!.sub}`,
    );

    res.status(204).end();
  };
}
