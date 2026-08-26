"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  X,
  FileText,
  Loader2,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useTrainerStore } from "@/stores/trainer-store";
import { useMemberStore } from "@/stores/member.store";
import { useOwnerStore } from "@/stores/owner.store";

// Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children?: NavItem[];
  badge?: number;
}

interface NavConfig {
  [key: string]: NavItem[];
}

// Mock navigation data
const navigationConfig: NavConfig = {
  owner: [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/owner/dashboard",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Applications",
      href: "/owner/applications",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Members",
      children: [
        { icon: <></>, label: "All Members", href: "/owner/members" },
        { icon: <></>, label: "Add New Member", href: "/owner/members/new" },
        {
          icon: <></>,
          label: "Renew Membership",
          href: "/owner/members/renew",
        },
      ],
    },
    {
      icon: <UserCog className="h-5 w-5" />,
      label: "Trainers",
      children: [
        { icon: <></>, label: "All Trainers", href: "/owner/trainers" },
        { icon: <></>, label: "Add New Trainer", href: "/owner/trainers/new" },
      ],
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Plans",
      children: [
        { icon: <></>, label: "All Plans", href: "/owner/plans" },
        { icon: <></>, label: "Add New Plan", href: "/owner/plans/new" },
      ],
    },
    // {
    //   icon: <CalendarCheck className="h-5 w-5" />,
    //   label: "Attendance",
    //   children: [
    //     { icon: <></>, label: "Attendance", href: "/owner/attendance" },
    //   ],
    // },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Payments",
      href: "/owner/payments",
    },
    {
      icon: <QrCode className="h-5 w-5" />,
      label: "QR Codes",
      href: "/owner/qr-codes",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billings",
      href: "/owner/billing",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/owner/settings",
    },
  ],
  trainer: [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/trainer/dashboard",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Members",
      href: "/trainer/members",
    },
    {
      icon: <CalendarCheck className="h-5 w-5" />,
      label: "Sessions",
      children: [
        { icon: <></>, label: "All Sessions", href: "/trainer/sessions" },
        { icon: <></>, label: "New Session", href: "/trainer/sessions/new" },
      ],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Templates",
      children: [
        { icon: <></>, label: "All Templates", href: "/trainer/templates" },
        { icon: <></>, label: "New Template", href: "/trainer/templates/new" },
      ],
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/trainer/settings",
    },
  ],
  member: [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/member/home" },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Discover",
      href: "/member/discover",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Applications",
      href: "/member/applications",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Membership",
      href: "/member/membership",
    },
    {
      icon: <CalendarCheck className="h-5 w-5" />,
      label: "Attendance",
      href: "/member/attendance",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Sessions",
      href: "/member/sessions",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/member/settings",
    },
  ],
};

// Child nav link with dot indicator
const ChildNavLink = ({
  item,
  isCollapsed,
  onClose,
}: {
  item: NavItem;
  isCollapsed: boolean;
  onClose?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (!item.href) return null;
  if (isCollapsed) return null;

  return (
    <Link href={item.href} onClick={onClose}>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2 ml-5 rounded-sm transition-all duration-150 cursor-pointer group relative",
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )}
      >
        {/* Active bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2  w-0.5 rounded-full bg-primary" />
        )}
        {/* Dot indicator */}
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-150",
            isActive
              ? "bg-primary scale-110"
              : "bg-muted-foreground/30 group-hover:bg-muted-foreground/60",
          )}
        />
        <span
          className={cn(
            "text-sm",
            isActive ? "font-semibold text-primary" : "font-normal",
          )}
        >
          {item.label}
        </span>
      </div>
    </Link>
  );
};

// Sidebar Item Component
const SidebarItem = ({
  item,
  isCollapsed,
  isExpanded,
  onExpand,
  onClose,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onClose?: () => void;
}) => {
  const pathname = usePathname();
  const hasChildren = !!item.children;
  const hasActiveChild =
    hasChildren && item.children?.some((child) => pathname === child.href);
  const isActive = item.href ? pathname === item.href : false;
  const isHighlighted = isActive || hasActiveChild;

  // Item with children (collapsible group)
  if (hasChildren && !isCollapsed) {
    return (
      <Collapsible open={isExpanded} onOpenChange={onExpand} className="w-full">
        <CollapsibleTrigger className={"w-full"}>
          <div
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm transition-all duration-150 cursor-pointer select-none group",
              isHighlighted
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent/60",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150",
                  isHighlighted
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground group-hover:text-foreground bg-transparent group-hover:bg-accent/50",
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  " text-sm font-medium ",
                  isHighlighted ? "text-primary" : "",
                )}
              >
                {item.label}
              </span>

              {item.badge && item.badge > 0 && (
                <span className="mr-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-0.5 space-y-0.5">
          {item.children?.map((child, idx) => (
            <ChildNavLink
              key={idx}
              item={child}
              isCollapsed={isCollapsed}
              onClose={onClose}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Collapsed with children → icon only with tooltip
  if (hasChildren && isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all duration-150",
                isHighlighted
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
              )}
            >
              {item.icon}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Simple link (no children)
  if (!item.href) return null;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                )}
              >
                {item.icon}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={item.href} onClick={onClose}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-accent/60",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150",
            isActive
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground group-hover:text-foreground bg-transparent group-hover:bg-accent/50",
          )}
        >
          {item.icon}
        </span>
        <span
          className={cn(
            "flex-1 text-sm font-medium",
            isActive ? "text-primary" : "",
          )}
        >
          {item.label}
        </span>
        {item.badge && item.badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
};

// Main Sidebar Component
interface SidebarProps {
  role?: "owner" | "trainer" | "member";
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  role = "owner",
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["Members"]), // default open
  );

  const clearTrainerContext = useTrainerStore(
    (state) => state.clearTrainerContext,
  );
  const clearMemberContext = useMemberStore((state) => state.clearActiveMember);
  const clearOwnerContext = useOwnerStore((state) => state.clearActiveOwner);
  const [isPending, setIsPending] = useState(false);

  const { signOut } = useClerk();
  const handleSignOut = async () => {
    try {
      setIsPending(true);

      await signOut();

      clearTrainerContext();
      clearMemberContext();
      clearOwnerContext();
      window.location.replace("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Something went wrong signing out");
    } finally {
      setIsPending(false);
    }
  };

  const navItems = navigationConfig[role] || navigationConfig.owner;

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed  left-0 top-0 z-50 h-screen bg-background border-r border-border/60 flex flex-col transition-all duration-300 ease-in-out ",
          isCollapsed ? "w-[72px]" : "w-[232px]",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo Section */}
        <div className="px-3 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            {/* Collapse toggle (only desktop pointer-events allowed) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center h-9 w-9 rounded-xl flex-shrink-0 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/25 pointer-events-none md:pointer-events-auto"
            >
              <span className="text-primary-foreground font-bold text-base leading-none">
                T
              </span>
            </button>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-foreground text-sm leading-tight">
                  TrackVim
                </span>
                <span className="text-xs text-primary font-medium capitalize">
                  {role} portal
                </span>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-colors flex-shrink-0 ml-auto"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Desktop collapse chevron */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-colors flex-shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav
            className={cn(
              "p-2.5 space-y-0.5",
              isCollapsed && "flex flex-col items-center",
            )}
          >
            {!isCollapsed && (
              <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Navigation
              </p>
            )}
            {navItems.map((item, idx) => (
              <SidebarItem
                key={idx}
                item={item}
                isCollapsed={isCollapsed}
                isExpanded={expandedItems.has(item.label)}
                onExpand={() => toggleExpand(item.label)}
                onClose={onClose}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/60 p-2.5">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer text-destructive hover:bg-destructive/10 transition-all duration-150"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium text-destructive"
                >
                  Sign Out
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-destructive hover:bg-destructive/10 group"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive bg-destructive/10 flex-shrink-0">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </span>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Spacer for layout offset */}
      <div
        className={cn(
          "hidden md:block flex-shrink-0 transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-[232px]",
        )}
      />
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-9 w-9 rounded-lg hover:bg-accent/70 transition-all duration-200 md:hidden"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}
