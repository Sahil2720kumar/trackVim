"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ReactNode, useState } from "react";
import { memberBreadcrumbRoutes } from "@/lib/breadcrumbs-config";

interface MemberLayoutProps {
  children: ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar – always visible on desktop, drawer on mobile */}
      <Sidebar
        role="member"
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        {/* Header – receives toggle to open sidebar on mobile */}
        <Header
          breadcrumbRoutes={memberBreadcrumbRoutes}
          onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)}
        />

        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
