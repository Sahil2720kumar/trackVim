"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ReactNode, useState } from "react";
import { useCurrentOwnerProfile } from "@/hooks/queries/profile.query";

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { data: user } = useCurrentOwnerProfile();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar – always visible on desktop, drawer on mobile */}
      <Sidebar
        role="owner"
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        {/* Header – receives toggle to open sidebar on mobile */}
        <Header
          userName={user?.username ?? undefined}
          userEmail={user?.email ?? undefined}
          userRole={user?.role ?? undefined}
          userImage={user?.avatar_url ?? undefined}
          onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)}
        />
        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
