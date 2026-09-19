import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Lock,
  ShieldCheck,
  Key,
  Server,
  Eye,
  AlertTriangle,
  Mail,
  ArrowRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Security | TrackVim",
  description:
    "Learn how TrackVim protects your gym data, personal information, and payment records with enterprise-grade security practices.",
};

const securityPrinciples = [
  {
    icon: Lock,
    title: "Data Encryption",
    description:
      "TrackVim uses encryption to protect data at rest and secure TLS connections to protect data while it is transmitted between your browser and our services.",
  },
  {
    icon: Key,
    title: "Authentication via Clerk",
    description:
      "TrackVim uses Clerk for authentication — a dedicated identity platform with MFA support, session management, and industry-grade security.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description:
      "Hosted on modern cloud infrastructure with automated backups, isolated environments, and regular security patching.",
  },
  {
    icon: Eye,
    title: "Access Controls",
    description:
      "Role-based access control ensures owners, trainers, and members can only access the data they're permitted to see.",
  },
  {
    icon: ShieldCheck,
    title: "Payment Security",
    description:
      "Payment receipts are stored securely. TrackVim never stores raw payment card data — all transaction records are handled through audited workflows.",
  },
  {
    icon: FileText,
    title: "Audit & Compliance",
    description:
      "Platform actions are logged and auditable. We maintain clear records of membership approvals, payment verifications, and attendance check-ins.",
  },
];

const practices = [
  "HTTPS enforced across all endpoints",
  "Webhook signatures verified server-side",
  "QR attendance codes use server-side signature secrets",
  "API routes protected by Clerk middleware",
  "No sensitive data exposed to the client",
  "Secure password reset and account recovery via Clerk",
  "Data deletion requests honored within 30 days",
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-8 bg-muted/20 border-b border-border/50">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-full max-w-6xl bg-primary/10 blur-[100px] opacity-50 -z-10"
          aria-hidden="true"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            <span>Security &amp; Trust</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Your Data is Safe with TrackVim
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Security is built into every layer of TrackVim — from how we store
            member data to how we verify payments and authenticate users.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="rounded-xl font-semibold gap-2">
              <Link
                className="flex flex-row gap-2 items-center justify-center"
                href="/contact"
              >
                Contact Security Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-xl font-medium"
            >
              <Link href="/privacy-policy">View Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Principles Grid */}
      <section className="py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How We Protect You
            </h2>
            <p className="text-muted-foreground max-w-xl">
              TrackVim is designed with security-first principles across every
              feature and data layer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {securityPrinciples.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all space-y-3 shadow-xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-foreground text-base">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-12 lg:py-16 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Security Practices
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Beyond principles, here are the specific technical measures
                TrackVim enforces across the platform.
              </p>
            </div>
            <ul className="space-y-3">
              {practices.map((practice) => (
                <li key={practice} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {practice}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Vulnerability Reporting */}
      <section className="py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border/70 space-y-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Found a Vulnerability?
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  We take security reports seriously. If you discover a
                  vulnerability in TrackVim, please disclose it responsibly by
                  contacting our security team directly. Do not publicly
                  disclose the issue before we have had a chance to investigate
                  and remediate.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button asChild className="rounded-xl font-semibold gap-2">
                <Link
                  className="flex flex-row gap-2 items-center justify-center"
                  href="mailto:security@trackvim.com"
                >
                  <Mail className="h-4 w-4" />
                  security@trackvim.com
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-xl font-medium"
              >
                <Link href="/report-bug">Report a Bug Instead</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
