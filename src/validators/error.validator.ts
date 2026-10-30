import { z } from "@/openapi/registry.ts";

export const HttpErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("HttpError");
