"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { memberBreadcrumbRoutes } from "@/lib/breadcrumbs-config";

import { useCurrentMemberProfile } from "@/hooks/queries/profile.query";
import { useMemberStore } from "@/stores/member.store";
import { useAuth } from "@clerk/nextjs";

interface MemberLayoutProps {
  children: ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: user, isLoading } = useCurrentMemberProfile();

  // ------------------------------------------------------------
  // Zustand
  // ------------------------------------------------------------

  const setActiveMemberContext = useMemberStore(
    (state) => state.setActiveMemberContext,
  );

  const setMemberships = useMemberStore((state) => state.setMemberships);

  const setGyms = useMemberStore((state) => state.setGyms);

  // ------------------------------------------------------------
  // Sync profile → Zustand
  // ------------------------------------------------------------
  const hasInitializedContext = useRef(false);
  useEffect(() => {
    if (!user) return;

    setMemberships(user.memberships);
    setGyms(user.gyms);
  }, [user, setMemberships, setGyms]);

  useEffect(() => {
    if (!user) return;
    if (hasInitializedContext.current) return;

    const firstMembership = user.memberships[0];

    if (!firstMembership) return;

    setActiveMemberContext(
      user.memberId,
      firstMembership.gymId,
      firstMembership.id,
    );

    hasInitializedContext.current = true;
  }, [user, setActiveMemberContext]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        role="member"
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="relative flex min-w-0 flex-1 flex-col px-4 lg:px-10">
        {/* Header */}
        <Header
          userName={user?.username ?? undefined}
          userEmail={user?.email ?? undefined}
          userRole={user?.role ?? undefined}
          userImage={user?.avatarUrl ?? undefined}
          breadcrumbRoutes={memberBreadcrumbRoutes}
          onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)}
        />

        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
