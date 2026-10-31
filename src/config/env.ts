import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url({ error: "DATABASE_URL must be a valid URL" }),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters long"),
    ALLOWED_ORIGINS: z
      .string()
      .default("http://localhost:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      )
      .pipe(z.array(z.url({ error: "Each origin must be a valid URL" }))),
    CLOUDINARY_URL: z.url().startsWith("cloudinary://", {
      message: "CLOUDINARY_URL must start with cloudinary://",
    }),
  })
  .transform((data) => ({
    ...data,
    IS_DEV: data.NODE_ENV === "development",
    IS_TEST: data.NODE_ENV === "test",
    IS_PROD: data.NODE_ENV === "production",
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors,
  );
  process.exit(1);
}

const env = parsed.data;

export default env;
