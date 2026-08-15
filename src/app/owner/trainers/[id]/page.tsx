import { notFound } from "next/navigation";
import {
  getTrainerById,
  getTrainerSessionStats,
  getMonthlySessionsForTrainer,
} from "@/services/owner.query";
import { TrainerProfileClient } from "@/components/owner/trainer/TrainerProfileClient";
import { auth } from "@clerk/nextjs/server";

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as unknown as string;

  if (!gymId) notFound();
  const [trainerResult, statsResult, monthlyResult] = await Promise.all([
    getTrainerById(id, gymId),
    getTrainerSessionStats(id),
    getMonthlySessionsForTrainer(id),
  ]);

  if (!trainerResult.success) notFound();

  return (
    <TrainerProfileClient
      trainerId={id}
      initialTrainer={trainerResult.data.trainer}
      assignedMembers={trainerResult.data.assignedMembers}
      initialStats={
        statsResult.success
          ? statsResult.data
          : { sessionsThisMonth: 0, attendanceRate: 0 }
      }
      monthlySessions={monthlyResult.success ? monthlyResult.data : []}
    />
  );
}
