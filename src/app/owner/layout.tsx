"use client";

import { ReactNode, Suspense, useEffect, useRef, useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ownerBreadcrumbRoutes } from "@/lib/breadcrumbs-config";

import { useCurrentOwnerProfile } from "@/hooks/queries/profile.query";
import { useOwnerStore } from "@/stores/owner.store";

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: user, isLoading } = useCurrentOwnerProfile();

  // ------------------------------------------------------------
  // Zustand
  // ------------------------------------------------------------

  const setActiveOwnerContext = useOwnerStore(
    (state) => state.setActiveOwnerContext,
  );

  const setOwner = useOwnerStore((state) => state.setOwner);

  const setGym = useOwnerStore((state) => state.setGym);

  // ------------------------------------------------------------
  // Sync profile → Zustand
  // ------------------------------------------------------------

  const hasInitializedContext = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (hasInitializedContext.current) return;

    // Owner must have at least one gym
    const firstGym = user.gyms?.[0];

    if (!firstGym) return;

    // Set owner IDs
    setActiveOwnerContext(user.id, firstGym.id);

    // Set owner information
    setOwner({
      fullName: user.full_name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
    });

    // Set active gym information
    setGym({
      name: firstGym.name,
      code: firstGym.code,
      logoUrl: firstGym.logo_url,
    });

    hasInitializedContext.current = true;
  }, [user, setActiveOwnerContext, setOwner, setGym]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Suspense fallback={null}>
        <Sidebar
          role="owner"
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </Suspense>
      {/* Main content */}
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        {/* Header */}
        <Suspense fallback={null}>
          <Header
            userName={user?.username ?? undefined}
            userEmail={user?.email ?? undefined}
            userRole={user?.role ?? undefined}
            userImage={user?.avatar_url ?? undefined}
            breadcrumbRoutes={ownerBreadcrumbRoutes}
            onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)}
          />
        </Suspense>
        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
