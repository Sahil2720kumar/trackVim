import TrainerProfileForm from "@/components/onboarding/TrainerProfileForm";

export default function TrainerProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <TrainerProfileForm />
      </div>
    </div>
  );
}
