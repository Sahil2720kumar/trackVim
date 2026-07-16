import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm min-h-[650px]">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span
            className="text-2xl text-foreground"
            style={{ fontFamily: "Archivo-Bold" }}
          >
            TrackVim 2
          </span>
          <p className="text-sm text-muted-foreground">
            Fitness &amp; gym management, all in one place.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
