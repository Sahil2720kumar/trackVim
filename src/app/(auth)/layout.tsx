import type { ReactNode } from "react";
import { AuthVisualShowcase } from "@/components/auth/AuthVisualShowcase";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Full Screen Grid Lines Background */}
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.06)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] z-0"
        aria-hidden="true"
      />

      {/* Shared Public Header */}
      <div className="relative z-20">
        <PublicHeader />
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 relative z-10">
        {/* Left Column: Visual Showcase */}
        <div className="hidden lg:flex lg:col-span-5 border-r border-border/40 h-full flex-col justify-between relative z-10">
          <AuthVisualShowcase />
        </div>

        {/* Right Column: Auth Form Container */}
        <div className="lg:col-span-7 flex flex-col justify-between relative z-10 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div
            className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px] opacity-70"
            aria-hidden="true"
          />

          <main className="flex-1 flex items-center justify-center p-2 sm:p-4 w-full my-auto z-10">
            <div className="w-full max-w-md mx-auto relative group">
              <div
                className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/10 rounded-[2.5rem] blur-xl opacity-60 transition-opacity duration-500 group-hover:opacity-90"
                aria-hidden="true"
              />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Shared Public Footer */}
      <div className="relative z-10">
        <PublicFooter />
      </div>
    </div>
  );
}
