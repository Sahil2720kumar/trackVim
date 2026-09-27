import { auth, currentUser } from "@clerk/nextjs/server";
import { getGymDetailsByToken } from "@/actions/processPublicAttendance.action";
import { PublicAttendanceClient } from "@/components/attendance/PublicAttendanceClient";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { userId } = await auth();

  let userDisplayName: string | null = null;
  if (userId) {
    const user = await currentUser();
    if (user) {
      if (user.firstName || user.lastName) {
        userDisplayName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      } else if (user.emailAddresses?.[0]?.emailAddress) {
        userDisplayName = user.emailAddresses[0].emailAddress;
      }
    }
  }

  const { valid, gymName } = token
    ? await getGymDetailsByToken(token)
    : { valid: false, gymName: undefined };

  return (
    <PublicAttendanceClient
      token={token}
      isSignedIn={Boolean(userId)}
      userDisplayName={userDisplayName}
      initialGymName={gymName}
      initialTokenValid={token ? valid : true}
    />
  );
}
