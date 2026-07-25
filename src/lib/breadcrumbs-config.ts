export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface BreadcrumbRoute {
  /** Route pattern using :param for dynamic segments, e.g. "/owner/members/:id" */
  pattern: string;
  items: BreadcrumbItem[];
}

/**
 * Ordered list of route → breadcrumb mappings.
 *
 * IMPORTANT: order matters. More specific / literal routes must come
 * before dynamic ones that could also match the same segment count —
 * e.g. "/owner/members/new" must be listed before "/owner/members/:id",
 * otherwise "new" would get swallowed by the :id param.
 */
export const ownerBreadcrumbRoutes: BreadcrumbRoute[] = [
  {
    pattern: "/owner/dashboard",
    items: [{ label: "Home", href: "/owner/dashboard" }],
  },
  {
    pattern: "/owner/members",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Members", href: "/owner/members" },
      { label: "All Members", href: "/owner/members", isActive: true },
    ],
  },
  {
    pattern: "/owner/members/new",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Members", href: "/owner/members" },
      { label: "All Members", href: "/owner/members" },
      { label: "Add New Member", href: "/owner/members/new", isActive: true },
    ],
  },
  {
    pattern: "/owner/members/:id/attendance",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Members", href: "/owner/members" },
      { label: "All Members", href: "/owner/members" },
      { label: "Member Details", href: "/owner/members/:id" },
      {
        label: "Attendance",
        href: "/owner/members/:id/attendance",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/owner/members/:id/payments",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Members", href: "/owner/members" },
      { label: "All Members", href: "/owner/members" },
      { label: "Member Details", href: "/owner/members/:id" },
      {
        label: "Payments",
        href: "/owner/members/:id/payments",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/owner/members/:id",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Members", href: "/owner/members" },
      { label: "All Members", href: "/owner/members" },
      { label: "Member Details", href: "/owner/members/:id", isActive: true },
    ],
  },
  {
    pattern: "/owner/trainers",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Trainers", href: "/owner/trainers" },
      { label: "All Trainers", href: "/owner/trainers", isActive: true },
    ],
  },
  {
    pattern: "/owner/trainers/new",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Trainers", href: "/owner/trainers" },
      { label: "All Trainers", href: "/owner/trainers" },
      { label: "Add New Trainer", href: "/owner/trainers/new", isActive: true },
    ],
  },
  {
    pattern: "/owner/trainers/:id",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Trainers", href: "/owner/trainers" },
      { label: "All Trainers", href: "/owner/trainers" },
      { label: "Trainer Details", href: "/owner/trainers/:id", isActive: true },
    ],
  },
  {
    pattern: "/owner/plans",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Plans", href: "/owner/plans" },
      { label: "All Plans", href: "/owner/plans", isActive: true },
    ],
  },
  {
    pattern: "/owner/plans/new",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Plans", href: "/owner/plans" },
      { label: "All Plans", href: "/owner/plans" },
      { label: "Add New Plan", href: "/owner/plans/new", isActive: true },
    ],
  },
  {
    pattern: "/owner/attendance",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Attendance", href: "/owner/attendance", isActive: true },
    ],
  },
  {
    pattern: "/owner/payments",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Payments", href: "/owner/payments" },
      { label: "All Payments", href: "/owner/payments", isActive: true },
    ],
  },
  {
    pattern: "/owner/payments/:id",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Payments", href: "/owner/payments" },
      { label: "Payment Details", href: "/owner/payments/:id", isActive: true },
    ],
  },
  {
    pattern: "/owner/settings",
    items: [
      { label: "Home", href: "/owner/dashboard" },
      { label: "Settings", href: "/owner/settings", isActive: true },
    ],
  },
];

export const memberBreadcrumbRoutes: BreadcrumbRoute[] = [
  {
    pattern: "/member/home",
    items: [{ label: "Home", href: "/member/home", isActive: true }],
  },

  {
    pattern: "/member/discover",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Discover", href: "/member/discover" },
      { label: "Browse Gyms", href: "/member/discover", isActive: true },
    ],
  },
  {
    pattern: "/member/discover/:id",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Discover", href: "/member/discover" },
      { label: "Gym Details", href: "/member/discover/:id", isActive: true },
    ],
  },
  {
    pattern: "/member/discover/:id/apply",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Discover", href: "/member/discover" },
      { label: "Gym Details", href: "/member/discover/:id" },
      {
        label: "Apply for Membership",
        href: "/member/discover/:id/apply",
        isActive: true,
      },
    ],
  },

  {
    pattern: "/member/applications",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Applications", href: "/member/applications" },
      {
        label: "My Applications",
        href: "/member/applications",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/member/applications/:id",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Applications", href: "/member/applications" },
      {
        label: "Application Details",
        href: "/member/applications/:id",
        isActive: true,
      },
    ],
  },

  {
    pattern: "/member/membership",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Membership", href: "/member/membership", isActive: true },
    ],
  },

  {
    pattern: "/member/attendance",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Attendance", href: "/member/attendance", isActive: true },
    ],
  },

  {
    pattern: "/member/sessions",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Sessions", href: "/member/sessions" },
      { label: "My Sessions", href: "/member/sessions", isActive: true },
    ],
  },
  {
    pattern: "/member/sessions/:id",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Sessions", href: "/member/sessions" },
      {
        label: "Session Details",
        href: "/member/sessions/:id",
        isActive: true,
      },
    ],
  },

  {
    pattern: "/member/settings",
    items: [
      { label: "Home", href: "/member/home" },
      { label: "Settings", href: "/member/settings", isActive: true },
    ],
  },
];

export const trainerBreadcrumbRoutes: BreadcrumbRoute[] = [
  {
    pattern: "/trainer/dashboard",
    items: [{ label: "Home", href: "/trainer/dashboard" }],
  },
  {
    pattern: "/trainer/members",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Members", href: "/trainer/members" },
      { label: "All Members", href: "/trainer/members", isActive: true },
    ],
  },
  // {
  //   pattern: "/trainer/members/new",
  //   items: [
  //     { label: "Home", href: "/trainer/dashboard" },
  //     { label: "Members", href: "/trainer/members" },
  //     { label: "All Members", href: "/trainer/members" },
  //     { label: "Add New Member", href: "/trainer/members/new", isActive: true },
  //   ],
  // },
  {
    pattern: "/trainer/members/:id",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Members", href: "/trainer/members" },
      { label: "All Members", href: "/trainer/members" },
      { label: "Member Details", href: "/trainer/members/:id", isActive: true },
    ],
  },
  {
    pattern: "/trainer/sessions",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Sessions", href: "/trainer/sessions", isActive: true },
    ],
  },
  {
    pattern: "/trainer/sessions/new",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Sessions", href: "/trainer/sessions" },
      {
        label: "Add New Session",
        href: "/trainer/sessions/new",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/trainer/sessions/:id",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Sessions", href: "/trainer/sessions" },
      {
        label: "Session Details",
        href: "/trainer/sessions/:id",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/trainer/sessions/:id/edit",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Sessions", href: "/trainer/sessions" },
      { label: "Session Details", href: "/trainer/sessions/:id" },
      {
        label: "Edit Session",
        href: "/trainer/sessions/:id/edit",
        isActive: true,
      },
    ],
  },
  {
    pattern: "/trainer/settings",
    items: [
      { label: "Home", href: "/trainer/dashboard" },
      { label: "Settings", href: "/trainer/settings", isActive: true },
    ],
  },
];

/**
 * Matches a real pathname (e.g. "/owner/members/42/attendance") against
 * the route patterns above (e.g. "/owner/members/:id/attendance") and
 * returns the matching breadcrumb items, or null if nothing matches.
 */
export function matchBreadcrumbRoute(
  pathname: string,
  routes: BreadcrumbRoute[] = ownerBreadcrumbRoutes,
): BreadcrumbItem[] | null {
  for (const route of routes) {
    const patternSegments = route.pattern.split("/");
    const pathSegments = pathname.split("/");

    if (patternSegments.length !== pathSegments.length) continue;

    const isMatch = patternSegments.every((seg, i) =>
      seg.startsWith(":") ? true : seg === pathSegments[i],
    );

    if (isMatch) return route.items;
  }
  return null;
}
