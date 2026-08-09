"use client";

import { useEffect, useState, useTransition } from "react";
import QRCode from "qrcode";
import {
  AlertCircle,
  CalendarCheck,
  Clock3,
  Download,
  DoorOpen,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  regenerateQrCodeAction,
  type QrCode as QrCodeRecord,
} from "@/actions/qr-code.actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QrCodesClient({
  gymId,
  initialQrCode,
}: {
  gymId: string;
  initialQrCode: QrCodeRecord;
}) {
  const [qrCode, setQrCode] = useState(initialQrCode);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan?token=${qrCode.token}`;

  useEffect(() => {
    QRCode.toDataURL(scanUrl, {
      width: 560,
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#0b1028", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((error) => {
        console.error("[QrCodesClient] failed to render QR", error);
        toast.error("Failed to render QR code");
      });
  }, [scanUrl]);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "trackvim-entrance-qr.png";
    link.click();
    toast.success("QR code downloaded");
  }

  function regenerateQr() {
    startTransition(async () => {
      const result = await regenerateQrCodeAction(gymId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setQrCode(result.qrCode);
      setConfirmOpen(false);
      toast.success("QR code regenerated", {
        description: "The previous code is no longer valid.",
      });
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            QR Codes
          </h1>
          <p className="mt-1.5 text-sm text-[#52618b] sm:text-base">
            Manage the QR code members use to check in and out of your gym.
          </p>
        </header>

        <Card className="overflow-hidden rounded-2xl border-[#e7e8f4] bg-white shadow-[0_8px_24px_rgba(37,44,95,0.06)]">
          <CardHeader className="px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#f4efff] text-[#531bff]">
                  <DoorOpen className="size-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">Entrance QR</h2>
                  <p className="mt-0.5 text-sm text-[#52618b]">
                    Members scan this QR code to check in and out of your gym.
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  "w-fit gap-1.5 rounded-full px-3.5 py-1 text-sm font-semibold",
                  qrCode.isActive
                    ? "bg-[#e9fbf1] text-[#069b5a] hover:bg-[#e9fbf1]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    qrCode.isActive ? "bg-[#0da965]" : "bg-muted-foreground",
                  )}
                />
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <Separator className="mx-6 w-auto sm:mx-8" />
          <CardContent className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
            <div className="mx-auto flex max-w-[500px] flex-col items-center">
              <div className="rounded-2xl border border-[#dfe3ef] bg-white p-4 shadow-[0_4px_12px_rgba(32,42,87,0.06)] sm:p-5">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Entrance QR code"
                    className="size-44 sm:size-52"
                  />
                ) : (
                  <div className="size-44 animate-pulse rounded bg-[#f3f4f9] sm:size-52" />
                )}
              </div>
              <h3 className="mt-2.5 text-base font-bold">{qrCode.label}</h3>
              <Badge
                className={cn(
                  "mt-1.5 gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  qrCode.isActive
                    ? "bg-[#e9fbf1] text-[#069b5a] hover:bg-[#e9fbf1]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    qrCode.isActive ? "bg-[#0da965]" : "bg-muted-foreground",
                  )}
                />
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>

              <div className="mt-4 grid w-full border-y border-[#e2e5f0] py-3.5 sm:grid-cols-2">
                <div className="flex items-center justify-center gap-3 border-b border-[#e2e5f0] pb-3.5 sm:border-b-0 sm:border-r sm:pb-0">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#f4efff] text-[#531bff]">
                    <CalendarCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#52618b]">Created</p>
                    <p className="text-sm font-semibold">
                      {formatDate(qrCode.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 pt-3.5 sm:pt-0">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#f4efff] text-[#531bff]">
                    <Clock3 className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#52618b]">Last updated</p>
                    <p className="text-sm font-semibold">
                      {formatDate(qrCode.updatedAt)}{" "}
                      <span className="text-[#52618b]">
                        • {formatTime(qrCode.updatedAt)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-10 border-2 border-[#6424ff] text-sm font-semibold text-[#531bff] hover:bg-[#f7f3ff]"
                  onClick={downloadQr}
                  disabled={!qrDataUrl}
                >
                  <Download className="size-4" data-icon="inline-start" />{" "}
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  className="h-10 border-2 border-[#ff3d52] text-sm font-semibold text-[#f22f48] hover:bg-[#fff5f6]"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isPending}
                >
                  <RefreshCw
                    className={cn("size-4", isPending && "animate-spin")}
                    data-icon="inline-start"
                  />{" "}
                  {isPending ? "Regenerating..." : "Regenerate QR"}
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-center text-xs text-[#52618b] sm:text-sm">
                <span className="flex size-6 items-center justify-center rounded-lg bg-[#f4efff] text-[#531bff]">
                  <ShieldCheck className="size-4" />
                </span>
                Regenerating the QR code will invalidate the previous code
                immediately.
              </p>
              {!qrCode.isActive && (
                <p className="mt-3 flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="size-3.5" /> This entrance code is
                  currently inactive.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate entrance QR?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the current code. Members will
              need to use the newly generated QR code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={regenerateQr} disabled={isPending}>
              {isPending ? "Regenerating..." : "Regenerate QR"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
