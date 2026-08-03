// app/onboarding/trainer-profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import TrainerProfileForm from "@/components/onboarding/TrainerProfileForm";

export default async function TrainerProfilePage() {
  const { sessionClaims } = await auth();
  const meta = (sessionClaims?.publicMetadata ?? {}) as {
    role?: string;
    trainerId?: string;
  };

  console.log("meta", meta);
  console.log(meta.role !== "trainer" || !meta.trainerId);

  // Trainer accounts only ever exist via invite (no organic signup path),
  // so trainerId should always be present here — same assumption noted
  // earlier in this thread. If it's missing, something upstream broke.
  if (meta.role !== "trainer" || !meta.trainerId) {
    redirect("/onboarding");
  }

  const supabase = await createServerClient();
  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", meta.trainerId)
    .single();

  console.log("trainer", trainer);

  console.log("error", error);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <TrainerProfileForm trainerId={trainer.id} initialData={trainer} />
      </div>
    </div>
  );
}
