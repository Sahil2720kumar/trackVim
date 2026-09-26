"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Subtle ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20"
        aria-hidden="true"
      >
        <div className="h-[380px] w-[380px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Main 404 Card Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xl shadow-foreground/5 backdrop-blur-sm transition-all sm:p-8">
        {/* TrackVim Brand Mark Header */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <TrackVimIcon size={24} className="text-primary" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            TrackVim
          </span>
        </div>

        {/* 404 Icon & Indicator */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm sm:h-18 sm:w-18">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </div>

        {/* Subtle 404 Tag */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          404 Not Found
        </div>

        {/* Heading & Description */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Page not found
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground sm:max-w-sm">
            We couldn&apos;t find the page you&apos;re looking for. It may have
            been moved, deleted, or the URL may be incorrect.
          </p>
        </div>

        {/* Primary & Secondary Navigation Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            asChild
            className="h-10 w-full gap-2 px-5 text-xs font-semibold shadow-sm sm:w-auto"
          >
            <Link
              className="flex flex-row items-center justify-center gap-2"
              href="/"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Go to Home</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleGoBack}
            className="h-10 w-full gap-2 px-5 text-xs font-semibold sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Go Back</span>
          </Button>
        </div>

        {/* Support / Contact Link */}
        <div className="mt-7 border-t border-border/40 pt-5 text-center">
          <p className="text-xs text-muted-foreground">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <HelpCircle
                className="h-3 w-3 inline shrink-0"
                aria-hidden="true"
              />
              <span>Contact TrackVim</span>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
