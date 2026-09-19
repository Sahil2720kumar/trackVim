import React from "react";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { LegalSection } from "@/components/legal/legal-section";
import {
  Lock,
  Sliders,
  BarChart3,
  ShieldCheck,
  Info,
  Cookie,
  ExternalLink,
  Mail,
  ArrowRight,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const metadata = {
  title: "Cookie Policy | TrackVim",
  description:
    "Learn how TrackVim uses cookies, local storage, and similar technologies to support authentication, security, and application preferences.",
};

const tocItems = [
  { id: "what-are-cookies", number: "01", title: "What Are Cookies?" },
  { id: "how-trackvim-uses-cookies", number: "02", title: "How TrackVim Uses Cookies" },
  { id: "types-of-cookies", number: "03", title: "Types of Cookies We May Use" },
  { id: "essential-cookies", number: "04", title: "Essential Cookies" },
  { id: "authentication-and-security", number: "05", title: "Authentication and Security" },
  { id: "preferences", number: "06", title: "Preferences" },
  { id: "analytics", number: "07", title: "Analytics" },
  { id: "third-party-cookies", number: "08", title: "Third-Party Cookies" },
  { id: "managing-cookies", number: "09", title: "Managing Cookies" },
  { id: "browser-controls", number: "10", title: "Browser Controls" },
  { id: "changes-to-policy", number: "11", title: "Changes to This Cookie Policy" },
  { id: "contact-us", number: "12", title: "Contact Us" },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="September 17, 2026"
      introduction="This Cookie Policy explains how TrackVim uses cookies and similar browser storage technologies when you use our website, mobile interface, and gym management SaaS platform."
      tocItems={tocItems}
    >
      {/* Policy Relationship Banner */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5 text-foreground font-medium">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>Cookies and browser storage may handle account session details.</span>
        </div>
        <Link
          href="/privacy-policy"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Read our Privacy Policy <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Section 1: What Are Cookies? */}
      <LegalSection id="what-are-cookies" number="01" title="What Are Cookies?">
        <p>
          Cookies are small text files or data fragments that websites and web applications store on your device (such as your computer, tablet, or mobile device) through your web browser. Cookies enable websites to remember your device, maintain active login sessions, store operational settings, and secure account interactions across page transitions.
        </p>
        <p>
          In addition to HTTP cookies, modern web applications like TrackVim may utilize similar browser-based storage technologies to deliver a smooth user experience:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Local Storage (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>):</strong> A persistent browser mechanism used to preserve client-side application state, such as visual theme preferences or selected active gym contexts, even after closing the browser tab.
          </li>
          <li>
            <strong className="text-foreground">Session Storage (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">sessionStorage</code>):</strong> Temporary storage cleared automatically when a browser tab or window session is terminated.
          </li>
          <li>
            <strong className="text-foreground">Browser Identifiers & Tokens:</strong> Secure cryptographic tokens passed in HTTP headers or essential request cookies to authorize access to protected multi-tenant APIs.
          </li>
        </ul>
      </LegalSection>

      {/* Cookie Categories Visual Component */}
      <div className="my-6 p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg">
          <Cookie className="h-5 w-5 text-primary" />
          <h3>Technology Categories at a Glance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Lock className="h-4 w-4" />
              <span>1. Essential & Auth</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Required for basic platform operations, Clerk session authentication, and multi-tenant security.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sliders className="h-4 w-4" />
              <span>2. Preferences</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Remembers light/dark mode selection and active gym/membership switcher context across logins.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm">
              <BarChart3 className="h-4 w-4 opacity-50" />
              <span>3. Analytics & Ad Pixels</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-medium">Not Implemented.</strong> TrackVim currently does not run third-party advertising or analytics cookies.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: How TrackVim Uses Cookies */}
      <LegalSection id="how-trackvim-uses-cookies" number="02" title="How TrackVim Uses Cookies">
        <p>
          TrackVim relies on cookies and local storage exclusively to support legitimate application functionality, secure tenant isolation, and ensure high operational performance.
        </p>
        <p>Specifically, our platform uses browser storage mechanisms to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Authenticate Users:</strong> Verify your identity when you sign in as a Gym Owner, Trainer, or Member.
          </li>
          <li>
            <strong className="text-foreground">Protect Multi-Tenant Security:</strong> Ensure request authorization headers and session tokens prevent cross-tenant data access.
          </li>
          <li>
            <strong className="text-foreground">Preserve Session State:</strong> Remember which gym workspace or member context you are actively managing when switching between views.
          </li>
          <li>
            <strong className="text-foreground">Store Display Preferences:</strong> Save your interface settings, such as dark mode or light mode appearance.
          </li>
        </ul>
        <p className="text-sm bg-muted/40 p-4 rounded-xl border border-border/60">
          <strong className="text-foreground">Notice:</strong> TrackVim does not sell user data, track users across third-party websites, or use cross-site tracking pixels for behavioral advertising.
        </p>
      </LegalSection>

      {/* Section 3: Types of Cookies We May Use */}
      <LegalSection id="types-of-cookies" number="03" title="Types of Cookies We May Use">
        <p>
          The table below details the categories of browser storage and cookie technologies implemented within the TrackVim application:
        </p>

        {/* Desktop & Mobile Responsive Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Storage Mechanism</th>
                  <th className="py-3 px-4">Purpose & Function</th>
                  <th className="py-3 px-4 text-center">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                <tr className="hover:bg-muted/20">
                  <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Essential & Auth
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">HTTP Cookies / Tokens</td>
                  <td className="py-3.5 px-4">
                    Maintains authenticated user session, authorization tokens, and CSRF security.
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Yes
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-primary" />
                    Preferences
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">localStorage</td>
                  <td className="py-3.5 px-4">
                    Saves active gym workspace selection and dark/light UI theme state.
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      Optional
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 opacity-40" />
                    Analytics
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">N/A</td>
                  <td className="py-3.5 px-4">
                    Not currently used on TrackVim.
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground/70">
                      No
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-1.5">
                    <Database className="h-4 w-4 opacity-40" />
                    Marketing / Ad Pixels
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">N/A</td>
                  <td className="py-3.5 px-4">
                    Not implemented. We do not place advertising cookies.
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground/70">
                      No
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block sm:hidden divide-y divide-border/60 p-2 space-y-3">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Essential & Auth
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Required: Yes
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Maintains signed-in authentication sessions and request security via Clerk token transport.
              </p>
              <div className="text-[11px] font-mono text-primary bg-primary/5 p-1.5 rounded">
                Mechanism: HTTP Cookies / Auth Tokens
              </div>
            </div>

            <div className="p-3 space-y-2 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-primary" /> Preferences
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  Required: Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Saves light/dark mode selection and active gym context in state stores.
              </p>
              <div className="text-[11px] font-mono text-muted-foreground bg-muted p-1.5 rounded">
                Mechanism: localStorage (Zustand & next-themes)
              </div>
            </div>

            <div className="p-3 space-y-2 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-muted-foreground/60" /> Analytics & Marketing
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground/70">
                  Required: No
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                TrackVim does not currently deploy third-party analytics or behavioral ad pixels.
              </p>
            </div>
          </div>
        </div>
      </LegalSection>

      {/* Section 4: Essential Cookies */}
      <LegalSection id="essential-cookies" number="04" title="Essential Cookies">
        <p>
          Essential cookies and session tokens are strictly necessary for the core operation of TrackVim. Without these technologies, users cannot securely log into their accounts, navigate role-protected dashboards (Owner, Trainer, Member), scan QR codes for attendance, or complete gym membership applications.
        </p>
        <p>Essential functions supported by these technologies include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>User authentication and active session management.</li>
          <li>Cross-Site Request Forgery (CSRF) protection and token verification.</li>
          <li>Tenant boundary verification preventing access to unauthorized gym records.</li>
          <li>Load balancing and session transport stability.</li>
        </ul>
        <p>
          Because these cookies are required for basic service delivery and account security, they cannot be turned off within our application interface. If you block essential cookies in your browser settings, key parts of TrackVim will cease to function properly.
        </p>
      </LegalSection>

      {/* Section 5: Authentication and Security */}
      <LegalSection id="authentication-and-security" number="05" title="Authentication and Security">
        <p>
          TrackVim integrates Clerk as our identity and access management partner. When you sign in to your TrackVim account, Clerk issues secure, encrypted session cookies and authentication headers to your browser.
        </p>
        <p>
          These authentication cookies allow our platform to verify that subsequent requests come from your verified account without requiring you to re-enter your password on every page transition.
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Security Principles:
          </h4>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
            <li>Session cookies are transmitted securely over encrypted HTTPS connections.</li>
            <li>Authentication tokens carry anti-tampering signatures verified server-side.</li>
            <li>Internal cryptographic secrets, encryption keys, and raw tokens are never exposed in public policy documentation.</li>
          </ul>
        </div>
      </LegalSection>

      {/* Section 6: Preferences */}
      <LegalSection id="preferences" number="06" title="Preferences">
        <p>
          TrackVim uses client-side web storage mechanisms (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>) to enhance your workflow by remembering your choices across sessions.
        </p>
        <p>The preference items saved locally on your device include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Interface Theme Preference:</strong> Managed by <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">next-themes</code>, storing whether you prefer light mode, dark mode, or system default display settings.
          </li>
          <li>
            <strong className="text-foreground">Member Active Gym Context:</strong> Saved in client state stores (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">member-store</code>) so multi-gym members remain on their chosen gym dashboard when reopening the application.
          </li>
          <li>
            <strong className="text-foreground">Owner & Trainer Session Context:</strong> Saved in client state stores (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">owner-store</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">trainer-store</code>) to preserve active workspace selections.
          </li>
        </ul>
        <p>
          Preference storage is non-sensitive and remains stored locally on your device until cleared through browser options or client logout actions.
        </p>
      </LegalSection>

      {/* Section 7: Analytics */}
      <LegalSection id="analytics" number="07" title="Analytics">
        <div className="p-4 rounded-xl bg-muted/30 border border-border/70 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>Implementation Accuracy Notice</span>
          </div>
          <p className="text-sm text-muted-foreground">
            TrackVim does not currently use third-party analytics cookies or user behavior tracking scripts on this website or platform.
          </p>
        </div>
        <p>
          We do not run tracking cookies from providers such as Google Analytics, PostHog, or Mixpanel. Operational logging is performed strictly on server infrastructure to monitor application reliability, system errors, and API uptime without tracking individual user browsing behavior across third-party websites.
        </p>
        <p className="text-xs text-muted-foreground">
          If TrackVim introduces optional analytical tools in future updates, this policy will be updated prior to implementation.
        </p>
      </LegalSection>

      {/* Section 8: Third-Party Cookies */}
      <LegalSection id="third-party-cookies" number="08" title="Third-Party Cookies">
        <p>
          When you use TrackVim, certain third-party infrastructure providers that supply essential services may set cookies or process browser identifiers required for their service integrations:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Clerk (Identity & Authentication):</strong> Sets essential session and security cookies to authenticate users and prevent account hijacking.
          </li>
          <li>
            <strong className="text-foreground">Razorpay (Payment Gateway):</strong> When Gym Owners process subscription payments or Members initiate payment verification flows, Razorpay may set fraud detection and payment session cookies within payment frames.
          </li>
          <li>
            <strong className="text-foreground">Cloudinary (Media Delivery):</strong> Serves gym logos, payment receipts, and profile images via content delivery networks (CDNs).
          </li>
        </ul>
        <p>
          Third-party services operate under their own privacy and cookie policies. We encourage users to review the privacy notices of these trusted infrastructure partners.
        </p>
      </LegalSection>

      {/* Section 9: Managing Cookies */}
      <LegalSection id="managing-cookies" number="09" title="Managing Cookies">
        <p>
          You have full control over the cookies and browser storage stored on your device. You can manage or delete browser storage through your browser settings or device options at any time.
        </p>
        <p>
          Please note that because TrackVim relies on essential cookies for user sign-in and session security, blocking or deleting essential cookies will prevent you from signing in or using protected platform features.
        </p>
        <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
          <h4 className="text-sm font-semibold text-foreground">How to clear local preference storage:</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You can clear locally saved theme and gym selection state by clearing site data or browser cache for <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">trackvim.com</code> within your browser developer tools or settings menu.
          </p>
        </div>
      </LegalSection>

      {/* Section 10: Browser Controls */}
      <LegalSection id="browser-controls" number="10" title="Browser Controls">
        <p>
          Most web browsers allow you to control cookies through their configuration preferences. You can configure your browser to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Accept or block all cookies automatically.</li>
          <li>Receive a notification whenever a website attempts to set a cookie.</li>
          <li>Block third-party cookies while allowing first-party cookies.</li>
          <li>Clear stored website data and cookies upon closing the browser window.</li>
        </ul>
        <p>
          To manage cookie controls, consult the official documentation for your web browser (e.g., Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge).
        </p>
      </LegalSection>

      {/* Section 11: Changes to This Cookie Policy */}
      <LegalSection id="changes-to-policy" number="11" title="Changes to This Cookie Policy">
        <p>
          TrackVim may update this Cookie Policy periodically to reflect changes in our technology stack, legal requirements, or service functionality.
        </p>
        <p>
          When updates are published, the revised policy will be posted on this page with an updated <strong className="text-foreground font-semibold">&quot;Last updated&quot;</strong> date (currently September 17, 2026). We encourage users to review this page periodically to remain informed about how we use cookies.
        </p>
      </LegalSection>

      {/* Section 12: Contact Us */}
      <LegalSection id="contact-us" number="12" title="Contact Us">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-primary/20 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Questions about our Cookie Policy?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions regarding how TrackVim uses cookies, local storage, or data privacy, please contact our team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="mailto:support@trackvim.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <Mail className="h-4 w-4" />
              <span>Contact TrackVim Support</span>
            </a>

            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              href="/terms-of-service"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Terms of Service</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
