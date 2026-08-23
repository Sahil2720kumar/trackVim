import { Suspense } from "react";
import { TrainerProfileFetcher } from "@/components/owner/trainer/TrainerProfileFetcher";

async function TrainerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <TrainerProfileFetcher trainerId={id} />;
}

export default function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <TrainerProfile params={params} />
    </Suspense>
  );
}
