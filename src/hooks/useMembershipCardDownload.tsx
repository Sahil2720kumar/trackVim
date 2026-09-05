"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
  MembershipCard,
  MembershipCardProps,
} from "@/components/MembershipCard";
import { generateMembershipQrDataUrl } from "@/lib/qr";

type MembershipCardInput = Omit<MembershipCardProps, "qrDataUrl" | "ref"> & {
  qrToken: string | null;
};

export function useMembershipCardDownload() {
  const [cardData, setCardData] = useState<Omit<
    MembershipCardProps,
    "ref"
  > | null>(null);
  const [fileName, setFileName] = useState("membership-card.png");
  const cardRef = useRef<HTMLDivElement>(null);
  const resolverRef = useRef<(() => void) | null>(null);

  const downloadCard = useCallback(
    async (data: MembershipCardInput, suggestedFileName: string) => {
      const qrDataUrl = data.qrToken
        ? await generateMembershipQrDataUrl(data.qrToken)
        : null;

      return new Promise<void>((resolve) => {
        resolverRef.current = resolve;
        setFileName(suggestedFileName);
        const { qrToken, ...rest } = data;
        setCardData({ ...rest, qrDataUrl });
      });
    },
    [],
  );

  useEffect(() => {
    if (!cardData || !cardRef.current) return;

    let cancelled = false;
    const node = cardRef.current;

    const waitForImages = async () => {
      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.onload = () => res();
                img.onerror = () => res();
              }),
        ),
      );
    };

    const run = async () => {
      try {
        await waitForImages();
        if (cancelled) return;

        const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
        if (cancelled) return;

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Couldn't generate the membership card.");
      } finally {
        if (!cancelled) {
          setCardData(null);
          resolverRef.current?.();
          resolverRef.current = null;
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData]);

  const CardCapture = cardData ? (
    <div
      style={{ position: "fixed", top: 0, left: -99999, pointerEvents: "none" }}
      aria-hidden
    >
      <MembershipCard ref={cardRef} {...cardData} />
    </div>
  ) : null;

  return { downloadCard, CardCapture };
}
