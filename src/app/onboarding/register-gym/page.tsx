import RegisterGymForm from "@/components/onboarding/RegisterGymForm";

export default async function RegisterGymPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Main Content ── */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <div className="text-lg font-bold">V</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Register Your Gym
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Tell us about your gym. This information helps you manage your
              members, trainers, billing, and facilities.
            </p>
          </div>

          {/* Registration Form */}
          <RegisterGymForm />
        </div>
      </div>
    </div>
  );
}
