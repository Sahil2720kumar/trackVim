import type { ReactNode } from "react";
import { PublicLayout } from "@/components/public/public-layout";

export default function PublicRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
