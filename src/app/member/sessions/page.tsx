import { CalendarDays, CheckCircle2, Dumbbell, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SessionsPanel } from "@/components/member/sessions/SessionsPanel";
import { getMyTrainingSessions } from "@/services/member.query";
import { getDisplayStatus } from "@/components/member/sessions/SessionsPanel";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub: string;
}

function StatsCard({ icon, iconBg, label, value, sub }: StatCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium leading-tight">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SessionsPage() {
  const { success, data, error } = await getMyTrainingSessions();
  if (!success) throw new Error(error ?? "Unable to load your sessions.");

  const sessions = data ?? [];

  const upcoming = sessions.filter((s) => getDisplayStatus(s) === "Upcoming");
  const completed = sessions.filter((s) => getDisplayStatus(s) === "Completed");

  const exerciseCount = sessions.reduce(
    (sum, s) => sum + (s.session_exercises?.length ?? 0),
    0,
  );
  const nextSession = upcoming[0]; // list is ordered soonest-first from the query

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

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            icon={<CalendarDays className="w-5 h-5 text-primary" />}
            iconBg="bg-primary/10"
            label="Upcoming Sessions"
            value={upcoming.length}
            sub={
              nextSession
                ? `Next: ${nextSession.session_name}`
                : "Nothing scheduled"
            }
          />
          <StatsCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            iconBg="bg-green-100 dark:bg-green-950/40"
            label="Completed Sessions"
            value={completed.length}
            sub="All time"
          />
          <StatsCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            iconBg="bg-orange-100 dark:bg-orange-950/40"
            label="Current Streak"
            value="—"
            sub="Coming soon"
          />
          <StatsCard
            icon={<Dumbbell className="w-5 h-5 text-primary" />}
            iconBg="bg-primary/10"
            label="Exercises Assigned"
            value={exerciseCount}
            sub="All sessions"
          />
        </div>

        <SessionsPanel sessions={sessions} />
      </div>
    </div>
  );
}
