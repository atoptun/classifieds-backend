import { registry } from "@/openapi.ts";
import z from "zod";

export const HttpErrorSchema = registry.register(
  "HttpError",
  z.object({
    error: z.string(),
  }),
);

