"use client";
import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CreditCard,
  ChevronRight,
  Menu,
  Loader2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import {
  matchBreadcrumbRoute,
  ownerBreadcrumbRoutes,
  type BreadcrumbRoute,
} from "@/lib/breadcrumbs-config";
import { useBreadcrumbOverride } from "@/providers/BreadcrumbProvider";
import { useNotifications } from "@/hooks/queries/notications.query";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notications.action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useTrainerStore } from "@/stores/trainer-store";

// ── Breadcrumb ──────────────────────────────────────────────────────────────
import type { BreadcrumbItem } from "@/lib/breadcrumbs-config";
import { useMemberStore } from "@/stores/member.store";
import { useOwnerStore } from "@/stores/owner.store";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-1.5 text-[13px] overflow-x-auto whitespace-nowrap scrollbar-none">
      {items.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
          {idx > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          )}
          <span
            className={cn(
              "transition-colors duration-150",
              crumb.isActive
                ? "text-indigo-600 dark:text-indigo-400 font-medium"
                : "text-muted-foreground hover:text-foreground cursor-pointer",
            )}
          >
            {crumb.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Sidebar Toggle ───────────────────────────────────────────────────────────
interface SidebarToggleProps {
  onClick?: () => void;
}

const SidebarToggle = ({ onClick }: SidebarToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-9 w-9 rounded-xl hover:bg-accent/60 transition-colors duration-200"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </Button>
  );
};

// ── Theme Toggle ─────────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-xl" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-11 w-11 rounded-xl hover:bg-accent/60 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-500 cursor-pointer" />
      ) : (
        <Moon className="w-5 h-5 text-muted-foreground cursor-pointer" />
      )}
    </Button>
  );
};

// ── Notification Bell ────────────────────────────────────────────────────────
interface NotificationRow {
  idx?: number;
  id: string;
  user_id: string;
  gym_id: string;
  type: string;
  title: string;
  body: string | null;
  data: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

function getNotifColor(type: string): string {
  if (type.includes("payment")) return "bg-blue-500";
  if (type.includes("member") || type.includes("application"))
    return "bg-emerald-500";
  if (type.includes("session") || type.includes("training"))
    return "bg-amber-500";
  if (
    type.includes("reject") ||
    type.includes("expir") ||
    type.includes("alert") ||
    type.includes("fail")
  )
    return "bg-rose-500";
  return "bg-indigo-500";
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const NotificationMenu = () => {
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const rows = notifications;
  const unreadCount = rows.filter((n) => !n.is_read).length;

  const handleMarkRead = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      try {
        const result = await markNotificationReadAction(id);
        if (result.success) {
          await queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } else {
          toast.error(result.error || "Failed to mark notification as read");
        }
      } catch (err) {
        toast.error("Failed to mark notification as read");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        const result = await markAllNotificationsReadAction();
        if (result.success) {
          await queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } else {
          toast.error(
            result.error || "Failed to mark all notifications as read",
          );
        }
      } catch (err) {
        toast.error("Failed to mark all notifications as read");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-accent/60 transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-1.5rem)] max-w-[360px] p-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center justify-between px-1 py-1.5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  {unreadCount} unread
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending || unreadCount === 0}
                onClick={handleMarkAllRead}
                className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 disabled:opacity-40"
              >
                Mark all read
              </Button>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-sm text-rose-500">
              Failed to load notifications
            </div>
          ) : rows.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up
            </div>
          ) : (
            rows.map((notif) => {
              const rowPending = pendingId === notif.id && isPending;
              return (
                <DropdownMenuItem
                  key={notif.id}
                  className={cn(
                    "cursor-pointer",
                    rowPending && "opacity-50 pointer-events-none",
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!notif.is_read) handleMarkRead(notif.id);
                  }}
                >
                  <div className="flex items-start gap-3 py-0.5 w-full">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                        !notif.is_read
                          ? getNotifColor(notif.type)
                          : "bg-muted-foreground/30",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !notif.is_read
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {notif.body}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground/70 flex-shrink-0 mt-0.5">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium w-full text-center py-0.5">
              View all notifications
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── User Menu ────────────────────────────────────────────────────────────────
interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userRole?: "owner" | "trainer" | "member";
  userImage?: string;
}

const UserMenu = ({
  userName = "Sahil Kumar",
  userEmail = "sahil@trackvim.com",
  userRole = "owner",
  userImage = undefined,
}: UserMenuProps) => {
  const settingsHref = `/${userRole}/settings`;
  const isOwner = userRole.toLowerCase() === "owner";

  const clearTrainerContext = useTrainerStore(
    (state) => state.clearTrainerContext,
  );
  const clearOwnerContext = useOwnerStore((state) => state.clearActiveOwner);
  const clearMemberContext = useMemberStore((state) => state.clearActiveMember);
  const [isPending, setIsPending] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      setIsPending(true);

      await signOut({
        redirectUrl: "/sign-in",
      });

      clearTrainerContext();
      clearMemberContext();
      clearOwnerContext();
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Something went wrong signing out");
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2.5 pl-2 pr-3 h-9 rounded-xl hover:bg-accent/60 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <Avatar className="h-7 w-7 ring-2 ring-indigo-500/20">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium leading-tight">
              {userName}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize leading-tight">
              {userRole}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 px-1 py-1">
              <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </span>
                <span className="text-xs text-muted-foreground truncate font-normal">
                  {userEmail}
                </span>
                <span className="mt-0.5 inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 capitalize w-fit">
                  {userRole}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Profile redirects into the role's settings page — there's no standalone profile route */}
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              className="flex flex-row flex-1 items-center "
              href={settingsHref}
            >
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              className="flex flex-row flex-1 items-center "
              href={settingsHref}
            >
              <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          {isOwner && (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                className="flex flex-row flex-1 items-center "
                href="/owner/billing"
              >
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Billing </span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={isPending}
            onClick={handleSignOut}
            className={cn(
              "cursor-pointer",
              isPending && "opacity-50 pointer-events-none",
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 text-rose-500 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2 text-rose-500" />
            )}
            <span className="text-rose-600 dark:text-rose-500 font-medium">
              {isPending ? "Signing out…" : "Sign Out"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── Main Header ──────────────────────────────────────────────────────────────
interface HeaderProps {
  /** Rarely needed — overrides the auto-derived title for this render. */
  title?: string;
  /** Route → breadcrumb config. Defaults to the owner route map. */
  breadcrumbRoutes?: BreadcrumbRoute[];
  /** Drives Settings/Profile routing and role-gated menu items (e.g. Billing). */
  userName?: string;
  userEmail?: string;
  userRole?: "owner" | "trainer" | "member";
  userImage?: string;
  onSidebarToggle?: () => void;
}

export function Header({
  title,
  breadcrumbRoutes = ownerBreadcrumbRoutes,

  userName = "",
  userEmail = "",
  userRole = "member",
  userImage = undefined,
  onSidebarToggle,
}: HeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { overrideLabel } = useBreadcrumbOverride();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDashboard =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/owner" ||
    pathname === "/owner/dashboard";

  const matchedItems = !isDashboard
    ? matchBreadcrumbRoute(pathname, breadcrumbRoutes)
    : null;

  const breadcrumbItems =
    matchedItems && overrideLabel
      ? matchedItems.map((item, idx) =>
          idx === matchedItems.length - 1
            ? { ...item, label: overrideLabel }
            : item,
        )
      : matchedItems;

  const showBreadcrumbs =
    mounted && !isDashboard && breadcrumbItems && breadcrumbItems.length > 0;

  const derivedTitle =
    pathname
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  const currentPage =
    title ??
    (isDashboard
      ? "Dashboard"
      : (breadcrumbItems?.[breadcrumbItems.length - 1]?.label ?? derivedTitle));

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-40 transition-all duration-300 md:left-[232px]",
        scrolled
          ? "border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm"
          : "border-b border-border/40 bg-background/80 backdrop-blur-md",
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {onSidebarToggle && <SidebarToggle onClick={onSidebarToggle} />}
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-none truncate pb-2">
              {currentPage}
            </h1>
            {showBreadcrumbs && <Breadcrumb items={breadcrumbItems!} />}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <NotificationMenu />
          <div className="hidden md:block h-6 w-px bg-border/60 mx-1.5" />
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            userImage={userImage}
          />
        </div>
      </div>
    </header>
  );
}
