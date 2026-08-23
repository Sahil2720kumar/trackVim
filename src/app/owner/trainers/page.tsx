import { TrainersTable } from "@/components/owner/TrainersTable";

export default function TrainersPage() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 pt-4 sm:pt-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Trainers
          </h1>
        </div>
      </div>

      <TrainersTable />
    </div>
  );
}
