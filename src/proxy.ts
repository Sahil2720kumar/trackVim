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

// Where an already-role-assigned user should land to finish onboarding.
// Invited trainers/members arrive with `role` pre-set in publicMetadata —
// they should never see the generic role picker.
const ONBOARDING_PATH_BY_ROLE: Record<"owner" | "trainer" | "member", string> = {
  owner: "/onboarding/register-gym",
  trainer: "/onboarding/trainer-profile",
  member: "/onboarding/member-profile",
};

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
  const pathname = req.nextUrl.pathname;

  // Signed in but hasn't finished onboarding -> force onboarding
  if (!onboardingComplete && !isOnboardingRoute(req)) {
    const destination = role
      ? ONBOARDING_PATH_BY_ROLE[role]
      : "/onboarding/select-role";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Lock each role to its own onboarding route. Without this, a trainer
  // could just type /onboarding/register-gym in the URL bar and land on
  // the owner's onboarding screen. API routes are excluded since they may
  // be shared across roles internally.
  if (
    !onboardingComplete &&
    isOnboardingRoute(req) &&
    !pathname.startsWith("/api/")
  ) {
    const isIndexRoute = pathname === "/onboarding";

    if (role) {
      const ownRoute = ONBOARDING_PATH_BY_ROLE[role];
      const isOwnRoute =
        pathname === ownRoute || pathname.startsWith(`${ownRoute}/`);

      if (!isOwnRoute && !isIndexRoute) {
        return NextResponse.redirect(new URL(ownRoute, req.url));
      }
    } else {
      // No role yet — only select-role (and the index redirector) is allowed.
      const isSelectRole = pathname.startsWith("/onboarding/select-role");
      if (!isSelectRole && !isIndexRoute) {
        return NextResponse.redirect(
          new URL("/onboarding/select-role", req.url),
        );
      }
    }
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