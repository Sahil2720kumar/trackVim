// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import { ReactQueryProviders } from "@/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { BreadcrumbOverrideProvider } from "@/providers/BreadcrumbProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TrackVim",
  description: "Gym management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider afterSignOutUrl="/sign-in">
            <ReactQueryProviders>
              <BreadcrumbOverrideProvider>
                <Toaster position="top-right" richColors />
                <TooltipProvider>{children}</TooltipProvider>
              </BreadcrumbOverrideProvider>
            </ReactQueryProviders>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
