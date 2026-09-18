"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  ArrowRight,
  LayoutDashboard,
  Home,
  Shield,
  Mail,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Contact", href: "/contact", icon: Mail },
  { name: "Report a Bug", href: "/report-bug", icon: Bug },
];

export function PublicHeader() {
  const { isSignedIn, user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const role = user?.publicMetadata?.role as string | undefined;
  const dashboardHref =
    role === "owner"
      ? "/owner/dashboard"
      : role === "trainer"
        ? "/trainer/dashboard"
        : role === "member"
          ? "/member/home"
          : "/onboarding/select-role";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/50 shadow-xs"
          : "bg-background/60 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg p-1"
            aria-label="TrackVim — Go to homepage"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-2 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <TrackVimIcon size={24} className="h-full w-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-sans">
              Track<span className="text-primary">Vim</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-primary transition-transform duration-300 hover:-rotate-12" />
                )}
              </Button>
            )}

            {isSignedIn ? (
              <Button
                asChild
                className="rounded-xl shadow-xs font-semibold gap-2 cursor-pointer"
              >
                <Link
                  className="flex items-center gap-2 cursor-pointer"
                  href={dashboardHref}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="rounded-xl text-foreground font-medium cursor-pointer"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl shadow-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Link href="/sign-up" className="flex items-center gap-2 ">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + Sheet menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-primary" />
                )}
              </Button>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                  <SheetTitle asChild>
                    <Link
                      href="/"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
                      aria-label="TrackVim — Go to homepage"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-1.5 shadow-xs">
                        <TrackVimIcon size={22} className="h-full w-full" />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-foreground font-sans">
                        Track<span className="text-primary">Vim</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-5rem)]">
                  {/* Nav Links */}
                  <nav
                    className="flex-1 px-4 py-4 space-y-1"
                    aria-label="Mobile navigation"
                  >
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-base font-medium text-foreground hover:bg-muted rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                          {link.name}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* CTA Buttons */}
                  <div className="px-4 pb-6 pt-4 border-t border-border/50 space-y-2.5">
                    {isSignedIn ? (
                      <Button
                        asChild
                        className="w-full rounded-xl py-5 text-base font-semibold gap-2"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full rounded-xl py-5 text-base font-semibold"
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full rounded-xl py-5 text-base font-semibold gap-2"
                          onClick={() => setSheetOpen(false)}
                        >
                          <Link
                            href="/sign-up"
                            className="flex items-center gap-2"
                          >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
