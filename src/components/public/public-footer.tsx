import React from "react";
import Link from "next/link";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

const productLinks = [
  { name: "Home", href: "/" },
  { name: "Security", href: "/security" },
  { name: "Sign In", href: "/sign-in" },
  { name: "Get Started", href: "/sign-up" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Cookie Policy", href: "/cookie-policy" },
  { name: "Refund Policy", href: "/refund-policy" },
  { name: "Data Deletion", href: "/data-deletion" },
];

const supportLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Report a Bug", href: "/report-bug" },
  { name: "Security", href: "/security" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
              aria-label="TrackVim — Go to homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-1.5 shadow-xs">
                <TrackVimIcon size={22} className="h-full w-full" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-sans">
                Track<span className="text-primary">Vim</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Smart gym management software for owners, trainers, and members.
            </p>
          </div>

          {/* Col 2 — Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground font-sans tracking-wide">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground font-sans tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground font-sans tracking-wide">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} TrackVim. All rights reserved.</p>
          <p>Gym &amp; Fitness Operations Management Platform</p>
        </div>
      </div>
    </footer>
  );
}
