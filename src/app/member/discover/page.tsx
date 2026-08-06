import { Building2 } from "lucide-react";
import { GymDiscoveryList } from "@/components/member/GymDiscoveryList";
import { getDiscoverGyms } from "@/services/member.query";

export default async function DiscoverPage() {
  const gyms = await getDiscoverGyms();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                Discover Gyms
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Find the perfect gym and apply for membership.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 flex-shrink-0 self-start">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {gyms.length}
            </span>
            <span className="text-sm text-muted-foreground">Gyms Found</span>
          </div>
        </div>

        <GymDiscoveryList initialGyms={gyms} />
      </div>
    </div>
  );
}
