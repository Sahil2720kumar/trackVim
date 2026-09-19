export const clerkAuthAppearance = {
  layout: {
    termsPageUrl: "/terms-of-service",
    privacyPageUrl: "/privacy-policy",
    helpPageUrl: "/contact",
  },

  variables: {
    // Use your theme variables instead of transparent/default Clerk colors
    colorPrimary: "oklch(0.5393 0.2713 286.7462)",

    // IMPORTANT: don't use transparent here
    colorBackground: "var(--card)",

    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",

    // Give inputs an actual theme background
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",

    colorBorder: "var(--border)",

    colorDanger: "oklch(0.629 0.1902 23.0704)",

    borderRadius: "0.85rem",

    fontFamily: "var(--font-sans)",
  },

  elements: {
    rootBox: "w-full flex justify-center",

    cardBox:
      "w-full shadow-2xl shadow-primary/10 rounded-[2.2rem] border border-border/80 bg-card/95 backdrop-blur-2xl p-0 overflow-hidden text-card-foreground transition-all duration-300 ring-1 ring-border/50",

    card: "w-full bg-card p-6 sm:p-8 border-0 shadow-none text-card-foreground",

    headerTitle:
      "text-2xl font-extrabold tracking-tight text-foreground text-left font-sans",

    headerSubtitle:
      "text-xs sm:text-sm text-muted-foreground text-left mt-1.5 font-normal leading-relaxed",

    socialButtonsBlockButton:
      "w-full h-11 border border-border/80 bg-background/80 hover:bg-accent hover:border-primary/40 text-foreground font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer",

    socialButtonsBlockButtonText: "text-sm font-semibold text-foreground",

    socialButtonsProviderIcon: "w-5 h-5",

    dividerLine: "bg-border/60 h-[1px]",

    dividerText:
      "text-[11px] font-semibold text-muted-foreground uppercase tracking-widest bg-card px-3 py-0.5 rounded-full border border-border/40",

    formFieldLabel:
      "text-xs font-semibold text-foreground/90 uppercase tracking-wider mb-1.5",

    formFieldInput:
      "h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-2xs",

    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground transition-colors cursor-pointer pr-3",

    formFieldInputShowPasswordIcon: "w-4 h-4 text-muted-foreground",

    formButtonPrimary:
      "h-11 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] cursor-pointer border-0 mt-2",

    identityPreviewText: "text-sm font-medium text-foreground",

    identityPreviewEditButtonIcon:
      "text-primary hover:opacity-80 cursor-pointer",

    formResendCodeLink:
      "text-primary font-semibold hover:underline cursor-pointer",

    otpCodeFieldInput:
      "rounded-xl border border-input bg-background text-lg font-bold text-foreground text-center focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs",

    alert:
      "rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-3 font-medium",

    alertText: "text-xs font-medium text-destructive",

    formFieldErrorText: "text-xs text-destructive font-medium mt-1",

    formFieldHintText: "text-xs text-muted-foreground mt-1",

    // IMPORTANT: explicit light/dark-compatible background
    footer: "bg-card text-card-foreground border-t border-border/40 pt-4 mt-4",

    footerActionLink:
      "text-primary font-semibold hover:text-primary/80 transition-colors underline-offset-4 hover:underline cursor-pointer",
  },
};
