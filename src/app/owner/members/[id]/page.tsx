import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { MemberProfileContent } from "@/components/owner/member/MemberProfileContent";

async function MemberProfileGate({ memberId }: { memberId: string }) {
  const { sessionClaims } = await auth();
  const gymId = sessionClaims?.publicMetadata?.gymId as string | undefined;
  if (!gymId) notFound();

  return <MemberProfileContent memberId={memberId} gymId={gymId} />;
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const memberId = (await params).id;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <Suspense fallback={null}>
        <MemberProfileGate memberId={memberId} />
      </Suspense>
    </div>
  );
}
