import { SessionsPanel } from "@/components/member/sessions/SessionsPanel";

export default async function SessionsPage() {
  
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Workout Sessions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View your assigned workout sessions, upcoming schedules, and
            completed workouts.
          </p>
        </div>

        <SessionsPanel  />
      </div>
    </div>
  );
}
