import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GARAGE_ENDPOINT: z.url(),
  GARAGE_REGION: z.string(),
  GARAGE_BUCKET: z.string(),
  GARAGE_ACCESS_KEY: z.string(),
  GARAGE_SECRET_KEY: z.string(),
});

export const config = envSchema.parse(import.meta.env);
