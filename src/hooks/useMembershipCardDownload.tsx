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

type QueueItem = {
  data: MembershipCardInput;
  suggestedFileName: string;
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

export function useMembershipCardDownload() {
  const [cardData, setCardData] = useState<Omit<
    MembershipCardProps,
    "ref"
  > | null>(null);
  const [fileName, setFileName] = useState("membership-card.png");
  const cardRef = useRef<HTMLDivElement>(null);

  const queueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);
  const currentItemRef = useRef<QueueItem | null>(null);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const nextItem = queueRef.current.shift()!;
    currentItemRef.current = nextItem;

    try {
      const qrDataUrl = nextItem.data.qrToken
        ? await generateMembershipQrDataUrl(nextItem.data.qrToken)
        : null;

      setFileName(nextItem.suggestedFileName);
      const { qrToken, ...rest } = nextItem.data;
      setCardData({ ...rest, qrDataUrl });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't generate QR code for membership card.");
      nextItem.reject(err);
      currentItemRef.current = null;
      isProcessingRef.current = false;
      processQueue();
    }
  }, []);

  const downloadCard = useCallback(
    (data: MembershipCardInput, suggestedFileName: string) => {
      return new Promise<void>((resolve, reject) => {
        queueRef.current.push({
          data,
          suggestedFileName,
          resolve,
          reject,
        });
        processQueue();
      });
    },
    [processQueue],
  );

  useEffect(() => {
    return () => {
      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift();
        item?.reject(new Error("Component unmounted"));
      }
    };
  }, []);

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
      let captureError: unknown = null;
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
        captureError = err;
        if (!cancelled) toast.error("Couldn't generate the membership card.");
      } finally {
        if (!cancelled) {
          setCardData(null);
          const activeItem = currentItemRef.current;
          currentItemRef.current = null;
          if (activeItem) {
            if (captureError) {
              activeItem.reject(captureError);
            } else {
              activeItem.resolve();
            }
          }
          isProcessingRef.current = false;
          processQueue();
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [cardData, fileName, processQueue]);

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
