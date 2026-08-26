import { MembersTable } from "@/components/owner/MembersTable";

export default function MembersPage() {
  return (
    <div className="flex flex-col px-4 py-5 gap-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Members
        </h1>
      </div>

      <MembersTable />
    </div>
  );
}
