import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ error: "DATABASE_URL must be a valid URL" }),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
});

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
