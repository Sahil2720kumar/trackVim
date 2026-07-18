"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ReactNode, useState } from "react";

interface MemberLayoutProps {
  children: ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar – always visible on desktop, drawer on mobile */}
      <Sidebar
        role="member"
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-[232px]">
        {/* Header – receives toggle to open sidebar on mobile */}
        <Header onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto pt-[64px]">
          {children}
        </main>
      </div>
    </div>
  );
}
