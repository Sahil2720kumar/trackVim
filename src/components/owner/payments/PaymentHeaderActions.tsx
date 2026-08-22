"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, Download, Share2, Loader2 } from "lucide-react";
import type { PaymentDetailData } from "@/services/owner.query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateStr } from "@/lib/utils";

export function PaymentHeaderActions({
  payment,
  gym,
  member,
  membership,
}: {
  payment: PaymentDetailData;
  gym: PaymentDetailData["gym"];
  member: PaymentDetailData["member"];
  membership: PaymentDetailData["membership"];
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => window.print();

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;
      let cursorY = 50;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text(gym.name, marginX, cursorY);

      const gymAddress = [
        gym.addressLine1,
        gym.addressLine2,
        gym.city,
        gym.state,
      ]
        .filter(Boolean)
        .join(", ");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      cursorY += 16;
      doc.text(gymAddress || "—", marginX, cursorY, { maxWidth: 280 });
      cursorY += 26;
      doc.text(`Phone: ${gym.contactPhone ?? "—"}`, marginX, cursorY);
      cursorY += 12;
      doc.text(`Email: ${gym.contactEmail ?? "—"}`, marginX, cursorY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 90, 31);
      doc.text("PAYMENT RECEIPT", pageWidth - marginX, 50, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const metaLines = [
        `Receipt No: ${payment.receiptId ?? payment.id.slice(0, 8)}`,
        `Payment Date: ${formatDateStr(payment.paymentDate)}`,
        `Status: ${payment.status}`,
      ];
      let metaY = 70;
      metaLines.forEach((line) => {
        doc.text(line, pageWidth - marginX, metaY, { align: "right" });
        metaY += 13;
      });

      cursorY = Math.max(cursorY, metaY) + 20;
      doc.setDrawColor(220, 220, 220);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("BILL TO", marginX, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(member.fullName ?? "—", marginX, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `Member ID: ${member.memberCode ?? member.id.slice(0, 8)}`,
        marginX,
        cursorY,
      );
      cursorY += 12;
      doc.text(
        `${member.contactPhone ?? "—"}  |  ${member.contactEmail ?? "—"}`,
        marginX,
        cursorY,
      );
      cursorY += 24;

      autoTable(doc, {
        startY: cursorY,
        head: [["Description", "Amount", "Discount", "Total"]],
        body: [
          [
            membership?.plan?.planName ?? "Payment",
            `INR ${membership?.planPrice ?? payment.amount}`,
            `- INR ${membership?.discount ?? 0}`,
            `INR ${payment.amount}`,
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [255, 90, 31], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        margin: { left: marginX, right: marginX },
      });

      // @ts-expect-error - lastAutoTable is added by the plugin at runtime
      let afterTableY = doc.lastAutoTable.finalY + 24;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 90, 31);
      doc.text("Amount Paid", pageWidth - marginX - 140, afterTableY);
      doc.text(`INR ${payment.amount}`, pageWidth - marginX, afterTableY, {
        align: "right",
      });
      afterTableY += 30;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("PAYMENT DETAILS", marginX, afterTableY);
      afterTableY += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      [
        `Method: ${payment.method ?? "—"}`,
        `Transaction Ref: ${payment.transactionRef ?? "—"}`,
        `Collected By: ${payment.collectedByName ?? "—"}`,
      ].forEach((line) => {
        doc.text(line, marginX, afterTableY);
        afterTableY += 13;
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "This document is an official payment receipt.",
        pageWidth / 2,
        pageHeight - 40,
        { align: "center" },
      );
      doc.text(
        "This receipt is computer generated and does not require a physical signature.",
        pageWidth / 2,
        pageHeight - 28,
        { align: "center" },
      );

      doc.save(`${payment.receiptId ?? payment.id.slice(0, 8)}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="flex-1 sm:flex-none"
        onClick={handlePrint}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print Receipt
      </Button>
      <Button
        size="default"
        className="flex-1 sm:flex-none"
        onClick={handleDownloadReceipt}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isDownloading ? "Generating..." : "Download PDF"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="default" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownloadReceipt}>
            Share Receipt
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Send Email</DropdownMenuItem>
          <DropdownMenuItem disabled>Send WhatsApp</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
