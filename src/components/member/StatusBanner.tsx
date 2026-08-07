// components/member/apply-steps/StatusBanner.tsx
type BannerVariant = "pending" | "approved" | "rejected";

const VARIANT_STYLES: Record<BannerVariant, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-red-300 bg-red-50 text-red-900",
};

export default function StatusBanner({
  variant,
  children,
}: {
  variant: BannerVariant;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 text-sm ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </div>
  );
}
