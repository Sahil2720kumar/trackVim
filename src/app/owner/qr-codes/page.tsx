import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureActiveQrCodeAction } from "@/actions/qr-code.actions";
import { QrCodesClient } from "@/components/owner/qr-code/QrCodesClient";

export default async function QRCodesPage() {
  const { sessionClaims } = await auth();
  const gymId = (sessionClaims?.publicMetadata as any)?.gymId as
    | string
    | undefined;

  if (!gymId) {
    throw new Error("Something went wrong");
  }

  const result = await ensureActiveQrCodeAction(gymId);

  if (!result.success) {
    return (
      <div className="p-8 text-center text-destructive">{result.error}</div>
    );
  }

  return <QrCodesClient gymId={gymId} initialQrCode={result.qrCode} />;
}
