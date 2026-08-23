import { TrainerProfileFetcher } from "@/components/owner/trainer/TrainerProfileFetcher";

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TrainerProfileFetcher trainerId={id} />;
}
