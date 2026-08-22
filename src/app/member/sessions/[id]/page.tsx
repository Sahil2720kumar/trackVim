import { notFound } from "next/navigation";
import { getTrainingSessionById } from "@/services/member.query";
import { SessionDetailClient } from "@/components/member/sessions/SessionDetailClient";
import { createServerClient } from "@/lib/supabase/server";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerClient();
  const { success, data } = await getTrainingSessionById(supabase, id);

  if (!success || !data) notFound();

  return <SessionDetailClient session={data} />;
}
