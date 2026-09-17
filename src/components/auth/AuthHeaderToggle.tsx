"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackVimIcon } from "@/components/icons/TrackVimIcon";

export function AuthHeaderToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full items-center justify-between px-4 py-3 sm:px-8">
      {/* Mobile Branding Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-1.5 shadow-sm">
          <TrackVimIcon size={22} className="h-full w-full" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight font-sans">
          TrackVim
        </span>
      </div>

      {/* Spacer for desktop layout alignment */}
      <div className="hidden lg:block" />

      {/* Theme Switcher Toggle */}
      {mounted && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl border border-border/70 bg-card/60 backdrop-blur-md transition-all duration-200 hover:bg-accent hover:border-primary/40 text-foreground"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-primary transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>
      )}
    </div>
  );
}
