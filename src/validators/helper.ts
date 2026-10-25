import z from "zod";
import { HttpErrorSchema } from "./error.validator.ts";
import { ResponseConfig, ZodRequestBody } from "@asteasolutions/zod-to-openapi";

export const jsonResponse = (
  description: string,
  schema?: z.ZodType,
): ResponseConfig => ({
  description,
  content: schema
    ? {
        "application/json": {
          schema,
        },
      }
    : undefined,
});

export const jsonBody = (schema: z.ZodType): ZodRequestBody => ({
  content: {
    "application/json": {
      schema,
    },
  },
});

export const errorResponse = (message: string, error?: string) => ({
  description: message,
  content: {
    "application/json": {
      schema: HttpErrorSchema,
      example: { error: error || message },
    },
  },
});
