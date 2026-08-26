"use client";

import { ReactNode, Suspense, useEffect, useRef, useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { trainerBreadcrumbRoutes } from "@/lib/breadcrumbs-config";

import { useCurrentTrainerProfile } from "@/hooks/queries/profile.query";
import { useTrainerStore } from "@/stores/trainer-store";

interface TrainerLayoutProps {
  children: ReactNode;
}

export default function TrainerLayout({ children }: TrainerLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: user, isLoading } = useCurrentTrainerProfile();

  // ------------------------------------------------------------
  // Zustand
  // ------------------------------------------------------------

  const setTrainerContext = useTrainerStore((state) => state.setTrainerContext);

  const setTrainer = useTrainerStore((state) => state.setTrainer);

  const setGym = useTrainerStore((state) => state.setGym);
  const setTrainerContexts = useTrainerStore(
    (state) => state.setTrainerContexts,
  );
  // ------------------------------------------------------------
  // Sync profile → Zustand
  // ------------------------------------------------------------

  const hasInitializedContext = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (hasInitializedContext.current) return;

    // ----------------------------------------------------------
    // Trainer can belong to multiple gyms.
    //
    // Each trainers[] row represents:
    //
    // trainer.id + trainer.gym_id
    //
    // ----------------------------------------------------------

    const firstTrainer = user.trainers?.[0];

    if (!firstTrainer) {
      console.warn("Trainer is not assigned to any gym");
      return;
    }

    const firstGym = firstTrainer.gyms;

    if (!firstGym) {
      console.warn("Trainer's gym was not found");
      return;
    }

    // ----------------------------------------------------------
    // Set active trainer + gym context
    // ----------------------------------------------------------

    setTrainerContext(firstTrainer.id, firstGym.id);

    // ----------------------------------------------------------
    // Set user/trainer information
    // ----------------------------------------------------------

    setTrainer({
      fullName: user.full_name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
    });

    // ----------------------------------------------------------
    // Set active gym information
    // ----------------------------------------------------------

    setGym({
      id: firstGym.id,
      name: firstGym.name,
      code: firstGym.code,
      logoUrl: firstGym.logo_url,
    });

    const contexts = user.trainers.map((trainer) => ({
      trainerId: trainer.id,
      gymId: trainer.gym_id,
    }));

    setTrainerContexts(contexts);

    hasInitializedContext.current = true;
  }, [user, setTrainerContext, setTrainer, setGym]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Suspense fallback={null}>
        <Sidebar
          role="trainer"
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
            breadcrumbRoutes={trainerBreadcrumbRoutes}
            onSidebarToggle={() => setIsMobileSidebarOpen((v) => !v)}
          />
        </Suspense>

        {/* Page content */}
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
