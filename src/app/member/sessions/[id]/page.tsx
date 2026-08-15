import { notFound } from "next/navigation";
import { getTrainingSessionById } from "@/services/member.query";
import { SessionDetailClient } from "@/components/member/sessions/SessionDetailClient";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("session id", id);

  const { success, data } = await getTrainingSessionById(id);

  if (!success || !data) notFound();

  return <SessionDetailClient session={data} />;
}
