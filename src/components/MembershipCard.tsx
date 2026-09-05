"use client";

import { Ref } from "react";
import Image from "next/image";
import { getInitials } from "@/lib/application-status";

export type MembershipCardProps = {
  memberName: string;
  memberCode: string;
  memberPhoto: string | null;
  planName: string;
  status: string;
  validUntil: string;
  qrDataUrl: string | null;
  gymName: string;
  gymLogoUrl: string | null;
  ref?: Ref<HTMLDivElement>; // Direct prop in React 19+ (or use innerRef for React 18)
};

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30",
  Expired: "bg-red-400/15 text-red-300 ring-1 ring-red-400/30",
  "Expiring Soon": "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  Pending: "bg-white/10 text-indigo-100 ring-1 ring-white/20",
};

export function MembershipCard({
  memberName,
  memberCode,
  memberPhoto,
  planName,
  status,
  validUntil,
  qrDataUrl,
  gymName,
  gymLogoUrl,
  ref,
}: MembershipCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 340,
        background:
          "radial-gradient(120% 140% at 8% 0%, #4338ca 0%, #312e81 46%, #1e1b4b 100%)",
      }}
      className="relative overflow-hidden rounded-2xl shadow-xl font-sans text-white"
    >
      {/* faint diagonal texture — reads as card stock, not decoration */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
        }}
      />

      {/* embossed ring motif bleeding off the top-right edge — nods to a card's foil seal */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.35) 0%, rgba(129,140,248,0) 70%)",
        }}
      />

      {/* Top band — gym identity + status */}
      <div className="relative flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-3 min-w-0">
          {gymLogoUrl ? (
            <Image
              src={gymLogoUrl}
              alt={gymName}
              width={40}
              height={40}
              crossOrigin="anonymous"
              unoptimized
              priority
              className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center font-bold shrink-0">
              {getInitials(gymName)}
            </div>
          )}
          <p className="font-semibold truncate">{gymName}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
            STATUS_BADGE[status] ??
            "bg-white/10 text-indigo-100 ring-1 ring-white/20"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Main content — member details + QR */}
      <div className="relative flex items-center gap-5 px-6 mt-6">
        {memberPhoto ? (
          <Image
            src={memberPhoto}
            alt={memberName}
            width={96}
            height={96}
            crossOrigin="anonymous"
            unoptimized
            priority
            className="w-24 h-24 rounded-xl object-cover shrink-0 ring-2 ring-white/25"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-white/10 ring-2 ring-white/25 flex items-center justify-center text-2xl font-bold shrink-0">
            {getInitials(memberName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold truncate">{memberName}</p>
          <p className="text-sm text-indigo-200">Member ID: {memberCode}</p>
          <p className="text-sm text-indigo-200 mt-1 truncate">{planName}</p>
          <p className="text-xs text-indigo-300 mt-1">
            Valid until {validUntil}
          </p>
        </div>

        <div className="shrink-0 bg-white p-2 rounded-lg">
          {qrDataUrl ? (
            // QR is a generated data URL — plain <img> is correct here, next/Image
            // adds no value for data URLs and complicates canvas capture.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Membership QR code"
              width={88}
              height={88}
            />
          ) : (
            <div className="w-[88px] h-[88px] flex items-center justify-center text-[10px] text-muted-foreground text-center px-2">
              QR not issued yet
            </div>
          )}
        </div>
      </div>

      {/* Footer / brand watermark */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-6 py-3 border-t border-white/10">
        <p className="text-[11px] text-indigo-300">
          Present this card at check-in
        </p>
        <p className="text-[11px] font-semibold tracking-wide text-indigo-200">
          Powered by TrackVim
        </p>
      </div>
    </div>
  );
}
