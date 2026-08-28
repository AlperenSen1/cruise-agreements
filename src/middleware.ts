import { defineMiddleware } from "astro:middleware";
import { auth } from "./auth";

const protectedActionNames = ["initiateAgreement", "sendUnsignedAgreement"];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedPage = context.url.pathname.startsWith("/agreements");
  const isProtectedAction = protectedActionNames.some(
    (name) => context.url.pathname === `/_actions/${name}`,
  );

  if (!isProtectedPage && !isProtectedAction) {
    return next();
  }

  const session = await auth.api.getSession({ headers: context.request.headers });

  if (!session) {
    return isProtectedPage
      ? context.redirect("/login")
      : new Response("Unauthorized", { status: 401 });
  }

  return next();
});
