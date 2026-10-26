import z from "zod";
import { AnnouncementCategory, Prisma } from "@db/client";
import { PublicUserSchema } from "./auth.validator.ts";
import { publicUserSelect } from "@/services/auth.service.ts";

export const GetAnnouncementsQuerySchema = z
  .object({
    search: z.string().min(1).max(100).optional(),
    sort: z.enum(["newest", "oldest"]).default("newest"),
    page: z.coerce.number().int().min(1).default(1).optional(),
    perPage: z.coerce.number().int().min(1).max(100).default(10).optional(),
  })
  .openapi("GetAnnouncementsQuery");

export const AnnouncementParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .openapi("AnnouncementParams");

type AnnouncementResponsePayload = Prisma.AnnouncementGetPayload<{
  include: { user: { select: typeof publicUserSelect } };
}>;

export const AnnouncementResponseSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    title: z.string().min(5).max(50).openapi({ example: "MacBook Pro 16 M3" }),
    description: z
      .string()
      .min(10)
      .openapi({ example: "Laptop in mint condition with box and charger" }),
    price: z
      .union([z.instanceof(Prisma.Decimal), z.string(), z.number()])
      .transform((val) => new Prisma.Decimal(val))
      .openapi({ type: "string", example: "1299.99" }),
    category: z
      .enum(AnnouncementCategory)
      .openapi({ example: AnnouncementCategory.SALE }),
    createdAt: z.date().openapi({ example: "2026-01-01T12:00:00.000Z" }),
    updatedAt: z.date().openapi({ example: "2026-01-01T12:00:00.000Z" }),
    user: PublicUserSchema,
  })
  .openapi("Announcement") satisfies z.ZodType<
  Omit<AnnouncementResponsePayload, "userId">
>;

export const InputCategorySchema = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(AnnouncementCategory),
);

export const CreateAnnouncementSchema = AnnouncementResponseSchema.pick({
  title: true,
  description: true,
})
  .extend({
    price: z
      .number()
      .positive("Price must be greater than 0")
      .max(99999999.99)
      .transform((val) => new Prisma.Decimal(val))
      .openapi({ type: "number", example: 1299.99 }),

    category: InputCategorySchema.openapi({
      type: "string",
      enum: Object.values(AnnouncementCategory),
      example: "sale",
    }),
  })
  .openapi("CreateAnnouncement");

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .openapi("UpdateAnnouncement");

export const PaginationSchema = z.object({
  total: z.number().positive().openapi({ example: 42 }),
  page: z.number().min(1).openapi({ example: 1 }),
  totalPages: z.number().positive().openapi({ example: 5 }),
  perPage: z.number().positive().openapi({ example: 10 }),
});

export const AnnouncementPaginationListSchema = z.object({
  data: z.array(AnnouncementResponseSchema),
  pagination: PaginationSchema,
});

export type GetAnnouncementsQuery = z.infer<typeof GetAnnouncementsQuerySchema>;
export type AnnouncementParams = z.infer<typeof AnnouncementParamsSchema>;
export type CreateAnnouncementBody = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementBody = z.infer<typeof UpdateAnnouncementSchema>;
export type AnnouncementResponse = z.infer<typeof AnnouncementResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type AnnouncementPaginationList = z.infer<
  typeof AnnouncementPaginationListSchema
>;
