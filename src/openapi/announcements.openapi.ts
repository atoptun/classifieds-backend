import {
  AnnouncementPaginationListSchema,
  AnnouncementParamsSchema,
  AnnouncementResponseSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAnnouncementSchema,
} from "@/validators/announcements.validator.ts";
import { errorResponse, jsonBody, jsonResponse } from "./helper.ts";
import { registry } from "./registry.ts";

registry.registerPath({
  method: "get",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Get all announcements with pagination, filtering and sorting",
  request: {
    query: GetAnnouncementsQuerySchema,
  },
  responses: {
    200: jsonResponse(
      "List of announcements with pagination metadata",
      AnnouncementPaginationListSchema,
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get an announcement by ID",
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    200: jsonResponse(
      "Announcement retrieved successfully",
      AnnouncementResponseSchema,
    ),
    404: errorResponse("Announcement not found"),
  },
});

registry.registerPath({
  method: "post",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Create a new announcement",
  security: [{ bearerAuth: [] }],
  request: {
    body: jsonBody(CreateAnnouncementSchema),
  },
  responses: {
    201: jsonResponse(
      "Announcement created successfully",
      AnnouncementResponseSchema,
    ),
    401: errorResponse("Authentication requred"),
    422: errorResponse("Validation error"),
  },
});

registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update an announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
    body: jsonBody(UpdateAnnouncementSchema),
  },
  responses: {
    200: jsonResponse(
      "Announcement updated successfully",
      AnnouncementResponseSchema,
    ),
    401: errorResponse("Authentication requred"),
    403: errorResponse("Access denied"),
    404: errorResponse("Announcement not found"),
    422: errorResponse("Validation error"),
  },
});

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete an announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    204: jsonResponse("Announcement deleted successfully"),
    401: errorResponse("Authentication requred"),
    403: errorResponse("Access denied"),
    404: errorResponse("Announcement not found"),
  },
});
