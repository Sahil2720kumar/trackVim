import { Building2 } from "lucide-react";
import { GymDiscoveryList } from "@/components/member/GymDiscoveryList";
import { getDiscoverGyms } from "@/services/member.query";

export default async function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <GymDiscoveryList />
      </div>
    </div>
  );
}
