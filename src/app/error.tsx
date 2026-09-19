"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, RefreshCcw, Bug, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Log error for client-side diagnostic/monitoring
    console.error("TrackVim Application Error:", error);
  }, [error]);

  const handleReportBug = () => {
    // Sanitize message to prevent exposing sensitive internal details or line breaks in URL
    const safeMsg = error?.message
      ? error.message.replace(/[\r\n]+/g, " ").slice(0, 150)
      : "Unexpected runtime issue";

    const params = new URLSearchParams();
    if (pathname) params.set("from", pathname);
    if (safeMsg) params.set("error", safeMsg);
    if (error?.digest) params.set("digest", error.digest);

    router.push(`/report-bug?${params.toString()}`);
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20"
        aria-hidden="true"
      >
        <div className="h-[350px] w-[350px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Main Error Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm transition-all">
        {/* TrackVim Brand Mark */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <TrackVimIcon size={22} />
          <span className="text-sm font-bold tracking-tight text-foreground">
            TrackVim
          </span>
        </div>

        {/* Error Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm">
          <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
        </div>

        {/* Heading and Description */}
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Something went wrong
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground sm:max-w-sm">
            We couldn&apos;t load this page right now. Please try again, or
            report the issue if the problem continues.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            onClick={() => reset()}
            className="h-9 w-full gap-2 px-4 text-xs font-semibold shadow-sm sm:w-auto"
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={handleReportBug}
            className="h-9 w-full gap-2 px-4 text-xs font-semibold sm:w-auto"
          >
            <Bug className="h-3.5 w-3.5" aria-hidden="true" />
            Report This Bug
          </Button>
        </div>

        {/* Error Reference / Digest */}
        {error?.digest && (
          <div className="mt-6 border-t border-border/40 pt-4 text-center">
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span>Reference:</span>
              <code className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                {error.digest}
              </code>
            </p>
          </div>
        )}

        {/* Secondary Go Back Navigation */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    </main>
  );
}
