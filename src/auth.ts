import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { config } from "config";
import { db } from "db";
import * as authSchema from "db/authSchema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.APP_BASE_URL,
  emailAndPassword: {
    enabled: true,
  },
});
