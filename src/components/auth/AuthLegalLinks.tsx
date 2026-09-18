import Link from "next/link";

export function AuthLegalLinks() {
  return (
    <div className="pt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
      <Link
        href="/privacy-policy"
        className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        Privacy Policy
      </Link>
      <span className="text-border/80 select-none">•</span>
      <Link
        href="/terms-of-service"
        className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        Terms of Service
      </Link>
      <span className="text-border/80 select-none">•</span>
      <Link
        href="/cookie-policy"
        className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        Cookie Policy
      </Link>
      <span className="text-border/80 select-none">•</span>
      <Link
        href="/contact"
        className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        Need Help?
      </Link>
    </div>
  );
}
