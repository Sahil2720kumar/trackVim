import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
]);

const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/api/onboarding/(.*)",
]);

const isOwnerRoute = createRouteMatcher(["/owner(.*)"]);
const isTrainerRoute = createRouteMatcher(["/trainer(.*)"]);
const isMemberRoute = createRouteMatcher(["/member(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const metadata = sessionClaims?.publicMetadata as
    | {
        role?: "owner" | "trainer" | "member";
        gymId?: string;
        onboardingComplete?: boolean;
      }
    | undefined;

  const role = metadata?.role;
  const onboardingComplete = Boolean(metadata?.onboardingComplete);

  // Signed in but hasn't finished onboarding -> force onboarding
  if (!onboardingComplete && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding/select-role", req.url));
  }

  // Already onboarded -> don't let them revisit onboarding
  if (onboardingComplete && isOnboardingRoute(req)) {
    if (role === "member") {
      return NextResponse.redirect(new URL("/member/home", req.url));
    }
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
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
