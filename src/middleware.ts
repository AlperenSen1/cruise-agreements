import { defineMiddleware } from "astro:middleware";
import { auth } from "./auth";

const publicActionNames = [
  "submitSignedAgreement",
  "rejectAgreement",
  "getUnsignedAgreementPdf",
  "markAgreementViewed",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedPage = context.url.pathname.startsWith("/agreements");
  const isActionRequest = context.url.pathname.startsWith("/_actions/");
  const isPublicAction = publicActionNames.some(
    (name) => context.url.pathname === `/_actions/${name}`,
  );

  const requiresAuth = isProtectedPage || (isActionRequest && !isPublicAction);

  if (!requiresAuth) {
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
