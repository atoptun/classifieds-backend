import z from "zod";

export const HttpErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("HttpError");
