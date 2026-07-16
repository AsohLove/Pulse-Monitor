import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z
    .string()
    .min(1, "JWT_SECRET is required"),

  LOG_LEVEL: z
    .enum([
      "fatal",
      "error",
      "warn",
      "info"
    ])
    .default("info"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("\n Invalid configuration:\n");

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

export const config = Object.freeze({
  env: result.data.NODE_ENV,
  port: result.data.PORT,
  databaseUrl: result.data.DATABASE_URL,
  jwtSecret: result.data.JWT_SECRET,
  logLevel: result.data.LOG_LEVEL,
});