import { AnnouncementsService } from "@/services/announcements.service.ts";
import {
  AnnouncementParams,
  CreateAnnouncementBody,
  GetAnnouncementsQuery,
  UpdateAnnouncementBody,
} from "@/validators/announcements.validator.ts";
import { Request, Response } from "express";

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
    const result = await this.service.create(req.body, Number(req.user!.sub));

    res.status(201).json(result);
  };

  updateAnnouncement = async (
    req: Request<AnnouncementParams, {}, UpdateAnnouncementBody>,
    res: Response,
  ) => {
    const result = await this.service.update(
      req.params.id,
      req.body,
      Number(req.user!.sub),
    );

    res.status(200).json(result);
  };

  deleteAnnouncement = async (
    req: Request<AnnouncementParams>,
    res: Response,
  ) => {
    await this.service.delete(req.params.id, Number(req.user!.sub));

    res.status(204).end();
  };
}
