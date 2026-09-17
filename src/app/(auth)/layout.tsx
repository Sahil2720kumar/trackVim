import type { ReactNode } from "react";
import { AuthVisualShowcase } from "@/components/auth/AuthVisualShowcase";
import { AuthHeaderToggle } from "@/components/auth/AuthHeaderToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-12 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Full Screen Grid Lines Background */}
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.08)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] z-0"
        aria-hidden="true"
      />

      {/* Left Column: Visual Showcase (Visible on lg screens) */}
      <div className="hidden lg:block lg:col-span-5 border-r border-border/40 h-full relative z-10">
        <AuthVisualShowcase />
      </div>

      {/* Right Column: Auth Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-between min-h-screen relative z-10">
        {/* Subtle Ambient Radial Light Flare */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px] opacity-70"
          aria-hidden="true"
        />

        {/* Top Navigation Header */}
        <AuthHeaderToggle />

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 w-full my-auto">
          <div className="w-full max-w-md mx-auto relative">
            {/* Ambient Card Backlight */}
            <div
              className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/10 rounded-[2.5rem] blur-xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            {children}
          </div>
        </main>

        {/* Bottom Footer */}
        <footer className="py-4 pr-2 text-center text-xs text-muted-foreground">
          <span>
            TrackVim &copy; {new Date().getFullYear()} — Gym &amp; Fitness
            Operations Management
          </span>
        </footer>
      </div>
    </div>
  );
}
