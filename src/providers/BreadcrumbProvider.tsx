"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbOverrideContextValue {
  overrideLabel: string | null;
  setOverrideLabel: (label: string | null) => void;
}

const BreadcrumbOverrideContext =
  createContext<BreadcrumbOverrideContextValue | null>(null);

export function BreadcrumbOverrideProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [overrideLabel, setOverrideLabel] = useState<string | null>(null);
  return (
    <BreadcrumbOverrideContext.Provider
      value={{ overrideLabel, setOverrideLabel }}
    >
      {children}
    </BreadcrumbOverrideContext.Provider>
  );
}

/**
 * Call from a dynamic page (e.g. member/[id]) once you have the entity's
 * display name, to replace the generic last breadcrumb label:
 *
 *   const { setOverrideLabel } = useBreadcrumbOverride();
 *   useEffect(() => {
 *     setOverrideLabel(member.name);
 *     return () => setOverrideLabel(null);
 *   }, [member.name]);
 *
 * Safe to call even if the provider isn't mounted — returns a no-op.
 */
export function useBreadcrumbOverride(): BreadcrumbOverrideContextValue {
  const ctx = useContext(BreadcrumbOverrideContext);
  if (!ctx) {
    return { overrideLabel: null, setOverrideLabel: () => {} };
  }
  return ctx;
}
