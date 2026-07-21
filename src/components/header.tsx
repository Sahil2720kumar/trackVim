"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Check,
  LogOut,
  User,
  Settings,
  CreditCard,
  ChevronRight,
  Building2,
  CalendarDays,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  matchBreadcrumbRoute,
  ownerBreadcrumbRoutes,
  type BreadcrumbRoute,
} from "@/lib/breadcrumbs-config";
import { useBreadcrumbOverride } from "@/providers/BreadcrumbProvider";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Breadcrumb ──────────────────────────────────────────────────────────────
import type { BreadcrumbItem } from "@/config/breadcrumbs-config";

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

// ── Gym Switcher ─────────────────────────────────────────────────────────────
interface Gym {
  id: string;
  name: string;
  location?: string;
}

const mockGyms: Gym[] = [
  { id: "1", name: "PowerFlex Gym", location: "Downtown" },
  { id: "2", name: "Iron House", location: "Westside" },
  { id: "3", name: "Fitness Factory", location: "North Park" },
  { id: "4", name: "Alpha Gym", location: "East End" },
];

const GymSwitcher = () => {
  const [selectedGym, setSelectedGym] = useState<Gym>(mockGyms[0]);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 h-9 px-3 rounded-xl border-border/60 bg-background/50 hover:bg-accent/60 transition-all duration-200",
            open && "ring-2 ring-indigo-500/20 border-indigo-300/50",
          )}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
            {selectedGym.name}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="mb-2 px-2 py-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Gyms
          </p>
        </div>
        <div className="space-y-0.5">
          {mockGyms.map((gym) => {
            const isSelected = selectedGym.id === gym.id;
            return (
              <button
                key={gym.id}
                onClick={() => {
                  setSelectedGym(gym);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 group",
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-accent/70 text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                    isSelected
                      ? "bg-white/20"
                      : "bg-muted group-hover:bg-background",
                  )}
                >
                  <Building2
                    className={cn(
                      "h-4 w-4",
                      isSelected ? "text-white" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-white" : "",
                    )}
                  >
                    {gym.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs truncate",
                      isSelected ? "text-indigo-100" : "text-muted-foreground",
                    )}
                  >
                    {gym.location}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-white flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-border/50">
          <button className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center gap-2 transition-colors">
            <Building2 className="h-3.5 w-3.5" />
            Add new gym
          </button>
        </div>
      </PopoverContent>
    </Popover>
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
      className="h-9 w-9 rounded-xl hover:bg-accent/60 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};

// ── Notification Bell ────────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "member" | "payment" | "session" | "alert";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New member registered",
    description: "Alex Johnson joined PowerFlex Gym",
    time: "5m ago",
    unread: true,
    type: "member",
  },
  {
    id: "2",
    title: "Session cancelled",
    description: "Morning yoga with Coach Lisa cancelled",
    time: "1h ago",
    unread: true,
    type: "session",
  },
  {
    id: "3",
    title: "Payment received",
    description: "₹2,499 received from Maria Garcia",
    time: "2h ago",
    unread: true,
    type: "payment",
  },
  {
    id: "4",
    title: "Membership expiring",
    description: "5 memberships expire in 3 days",
    time: "Yesterday",
    unread: false,
    type: "alert",
  },
];

const notifTypeColors: Record<Notification["type"], string> = {
  member: "bg-emerald-500",
  payment: "bg-blue-500",
  session: "bg-amber-500",
  alert: "bg-rose-500",
};

const NotificationMenu = () => {
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-accent/60 transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
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
                className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                Mark all read
              </Button>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {mockNotifications.map((notif) => (
            <DropdownMenuItem key={notif.id} className="cursor-pointer">
              <div className="flex items-start gap-3 py-0.5 w-full">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                    notif.unread
                      ? notifTypeColors[notif.type]
                      : "bg-muted-foreground/30",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      notif.unread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {notif.description}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground/70 flex-shrink-0 mt-0.5">
                  {notif.time}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
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
  userRole?: string;
  userImage?: string;
}

const UserMenu = ({
  userName = "Sahil Kumar",
  userEmail = "sahil@trackvim.com",
  userRole = "Owner",
  userImage = undefined,
}: UserMenuProps) => {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
              {initials}
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
                  {initials}
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
          <DropdownMenuItem className="cursor-pointer">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-500 font-medium">
              Sign Out
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
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userImage?: string;
  onSidebarToggle?: () => void;
}

export function Header({
  title,
  breadcrumbRoutes = ownerBreadcrumbRoutes,
  userName = "Sahil Kumar",
  userEmail = "sahil@trackvim.com",
  userRole = "Owner",
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

  // Dashboard is the root/landing screen — it only ever shows its own
  // title, never a breadcrumb trail, even if a route match exists.
  const isDashboard =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/owner" ||
    pathname === "/owner/dashboard";

  // Look up the current path against the breadcrumb config. Returns null
  // if nothing matches (e.g. a page not yet added to the map).
  const matchedItems = !isDashboard
    ? matchBreadcrumbRoute(pathname, breadcrumbRoutes)
    : null;

  // If a dynamic page has called useBreadcrumbOverride() to set a real
  // entity name (e.g. a member's name), swap it in for the last crumb.
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

  // Page heading: explicit title prop > last breadcrumb label > derived
  // from the URL segment > "Dashboard" as the final fallback.
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
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {onSidebarToggle && <SidebarToggle onClick={onSidebarToggle} />}
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-none truncate pb-2">
              {currentPage}
            </h1>
            {showBreadcrumbs && <Breadcrumb items={breadcrumbItems!} />}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <NotificationMenu />
          <div className="hidden sm:block h-6 w-px bg-border/60 mx-1 sm:mx-1.5" />
          <GymSwitcher />
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
