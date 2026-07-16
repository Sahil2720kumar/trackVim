import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * NOTE ON FILE NAME
 * Next.js only auto-runs middleware from a file literally named `middleware.ts`
 * (at the project root or inside `src/`). If you keep this file as `proxy.ts`,
 * rename/re-export it as `src/middleware.ts`, e.g.:
 *
 *   // src/middleware.ts
 *   export { default, config } from "./proxy";
 *
 * Otherwise Next.js will silently never run this and none of the route
 * protection below will apply.
 */

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  "/api/(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const isOwnerRoute = createRouteMatcher(["/owner(.*)"]);
const isTrainerRoute = createRouteMatcher(["/trainer(.*)"]);
const isMemberRoute = createRouteMatcher(["/member(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const role = sessionClaims?.publicMetadata?.role as
    | "owner"
    | "trainer"
    | "member"
    | undefined;
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;

  console.log("sessionClaims", sessionClaims);

  // Signed in but hasn't finished onboarding (no role/gym yet) -> force onboarding
  const onboardingComplete = Boolean(role && (role === "owner" ? gymId : gymId));

  if (!onboardingComplete && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding/select-role", req.url));
  }

  // Already onboarded -> don't let them revisit onboarding
  if (onboardingComplete && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`.replace("owner/dashboard", "owner/dashboard"), req.url));
  }

  // Role-gate the dashboards
  if (isOwnerRoute(req) && role !== "owner") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isTrainerRoute(req) && role !== "trainer") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isMemberRoute(req) && role !== "member") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
