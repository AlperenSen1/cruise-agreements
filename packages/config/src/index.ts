import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GARAGE_ENDPOINT: z.url(),
  GARAGE_REGION: z.string(),
  GARAGE_BUCKET: z.string(),
  GARAGE_ACCESS_KEY: z.string(),
  GARAGE_SECRET_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  APP_BASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

// Fail fast at boot if a required env var is missing or malformed, instead of
// failing unpredictably deep inside a request later. See .env.example for the
// full list of variables this app needs.
export const config = envSchema.parse(import.meta.env);
