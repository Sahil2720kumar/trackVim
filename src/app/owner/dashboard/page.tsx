import { currentUser } from "@clerk/nextjs/server";

import { OwnerDashboardContent } from "@/components/owner/dashboard/Ownerdashboardcontent";

export default async function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <OwnerDashboardContent />
      </div>
    </div>
  );
}
