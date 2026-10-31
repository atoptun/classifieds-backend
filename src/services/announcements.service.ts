import {
  AnnouncementPaginationList,
  AnnouncementResponse,
  CreateAnnouncementBody,
  GetAnnouncementsQuery,
  UpdateAnnouncementBody,
} from "@/validators/announcements.validator.ts";
import { Prisma, PrismaClient } from "@db/client";
import { publicUserSelect } from "./auth.service.ts";
import { ForbiddenError, NotFoundError } from "@/errors/http.error.ts";

export type CreateAnnouncementBodyService = CreateAnnouncementBody & {
  imageUrl?: string | null;
  imageId?: string | null;
};

export type UpdateAnnouncementBodyService = UpdateAnnouncementBody & {
  imageUrl?: string | null;
  imageId?: string | null;
};

export const publicAnnouncementSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  user: { select: publicUserSelect },
} as const satisfies Prisma.AnnouncementSelect;

export class AnnouncementsService {
  constructor(private db: PrismaClient) {}

  listAll = async (
    query: GetAnnouncementsQuery,
  ): Promise<AnnouncementPaginationList> => {
    const { search, sort = "newest", page = 1, perPage = 10 } = query;

    const skip = (page - 1) * perPage;
    const take = perPage;

    const where: Prisma.AnnouncementWhereInput = {};

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const orderBy: Prisma.AnnouncementOrderByWithRelationInput = {
      createdAt: sort === "newest" ? "desc" : "asc",
    };

    const [list, total] = await Promise.all([
      this.db.announcement.findMany({
        select: publicAnnouncementSelect,
        where,
        skip,
        take,
        orderBy,
      }),
      this.db.announcement.count({ where }),
    ]);

    return {
      data: list,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / perPage),
        perPage,
      },
    };
  };

  getById = async (id: number): Promise<AnnouncementResponse> => {
    const result = await this.db.announcement.findUnique({
      select: publicAnnouncementSelect,
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError("Announcement not found");
    }

    return result;
  };

  create = async (
    body: CreateAnnouncementBodyService,
    userId: number,
  ): Promise<AnnouncementResponse> => {
    const { title, description, price, category, imageUrl, imageId } = body;

    const result = await this.db.announcement.create({
      data: {
        title,
        description,
        price,
        category,
        imageUrl,
        imageId,
        user: {
          connect: { id: userId },
        },
      },
      select: publicAnnouncementSelect,
    });

    return result;
  };

  update = async (
    id: number,
    body: UpdateAnnouncementBodyService,
    userId: number,
  ): Promise<{ updated: AnnouncementResponse; oldImageId: string | null }> => {
    const exist = await this.checkExistAndOwner(id, userId);

    const { title, description, price, category, imageUrl, imageId } = body;

    const updateData: Prisma.AnnouncementUpdateInput = {
      title,
      description,
      price,
      category,
      imageUrl,
      imageId,
    };

    const updated = await this.db.announcement.update({
      select: publicAnnouncementSelect,
      where: { id },
      data: updateData,
    });

    return { updated, oldImageId: exist.imageId };
  };

  delete = async (
    id: number,
    userId: number,
  ): Promise<{ oldImageId: string | null }> => {
    const exist = await this.checkExistAndOwner(id, userId);

    await this.db.announcement.delete({
      where: { id },
    });

    return { oldImageId: exist.imageId };
  };

  private checkExistAndOwner = async (
    id: number,
    userId: number,
  ): Promise<Prisma.AnnouncementModel> => {
    const exist = await this.db.announcement.findUnique({
      // select: { id: true, userId: true },
      where: { id },
    });

    if (!exist) {
      throw new NotFoundError("Announcement not found");
    }

    if (exist.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    return exist;
  };
}
