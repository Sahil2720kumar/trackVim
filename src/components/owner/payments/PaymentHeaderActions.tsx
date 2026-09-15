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
import { toPng } from "html-to-image";
import { formatDateStr } from "@/lib/utils";
import { toast } from "sonner";

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

      const element = document.getElementById("trackvim-payment-receipt");
      const receiptFilename = `${payment.receiptId || `TVM-${payment.id.slice(0, 8).toUpperCase()}`}.pdf`;

      if (element) {
        // High quality DOM to canvas export for 100% visual fidelity
        const dataUrl = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          cacheBust: true,
        });

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(receiptFilename);
        toast.success("Receipt downloaded successfully");
        return;
      }

      // Fallback manual PDF generation matching TrackVim design
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;
      let cursorY = 50;

      // Primary color accent (TrackVim purple)
      const primaryColor: [number, number, number] = [124, 58, 237];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text(gym.name, marginX, cursorY);

      const gymAddress = [
        gym.addressLine1,
        gym.addressLine2,
        gym.city,
        gym.state,
        gym.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      cursorY += 16;
      doc.text(gymAddress || "—", marginX, cursorY, { maxWidth: 280 });
      cursorY += 26;
      if (gym.contactPhone) {
        doc.text(`Phone: ${gym.contactPhone}`, marginX, cursorY);
        cursorY += 12;
      }
      if (gym.contactEmail) {
        doc.text(`Email: ${gym.contactEmail}`, marginX, cursorY);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text("PAYMENT RECEIPT", pageWidth - marginX, 50, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const isPaid = payment.status === "Verified";
      const customerStatus = isPaid ? "PAID" : payment.status;
      const metaLines = [
        `Receipt No: ${payment.receiptId || `TVM-${payment.id.slice(0, 8).toUpperCase()}`}`,
        `Payment Date: ${payment.paymentDate ? formatDateStr(payment.paymentDate) : "—"}`,
        `Status: ${customerStatus}`,
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
      doc.text(member.fullName ?? "Member", marginX, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `Member ID: ${member.memberCode ?? `ID-${member.id.slice(0, 8)}`}`,
        marginX,
        cursorY,
      );
      cursorY += 12;

      const memberContacts = [member.contactPhone, member.contactEmail]
        .filter(Boolean)
        .join(" | ");
      if (memberContacts) {
        doc.text(memberContacts, marginX, cursorY);
        cursorY += 24;
      } else {
        cursorY += 12;
      }

      const planName = membership?.plan?.planName ?? "Gym Membership Fee";
      const planPrice = membership?.planPrice ?? payment.amount + (payment.discount ?? 0);
      const discount = membership?.discount ?? payment.discount ?? 0;

      autoTable(doc, {
        startY: cursorY,
        head: [["Description", "Amount", "Discount", "Total"]],
        body: [
          [
            planName,
            `₹${planPrice.toLocaleString("en-IN")}`,
            discount > 0 ? `-₹${discount.toLocaleString("en-IN")}` : "₹0",
            `₹${payment.amount.toLocaleString("en-IN")}`,
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
        },
        margin: { left: marginX, right: marginX },
      });

      // @ts-expect-error - lastAutoTable is added by the plugin at runtime
      let afterTableY = doc.lastAutoTable.finalY + 24;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text("Amount Paid", pageWidth - marginX - 140, afterTableY);
      doc.text(
        `₹${payment.amount.toLocaleString("en-IN")}`,
        pageWidth - marginX,
        afterTableY,
        { align: "right" },
      );
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
        `Verified By: ${payment.verifiedByName ?? "—"}`,
      ].forEach((line) => {
        doc.text(line, marginX, afterTableY);
        afterTableY += 13;
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Thank you for choosing ${gym.name}!`,
        pageWidth / 2,
        pageHeight - 45,
        { align: "center" },
      );
      doc.text(
        "This receipt is computer generated and does not require a physical signature.",
        pageWidth / 2,
        pageHeight - 32,
        { align: "center" },
      );
      doc.text("Powered by TrackVim", pageWidth / 2, pageHeight - 20, {
        align: "center",
      });

      doc.save(receiptFilename);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Failed to generate receipt PDF", error);
      toast.error("Couldn't generate the receipt PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="default"
        className="flex-1 sm:flex-none"
        onClick={handlePrint}
      >
        <Printer className="w-4 h-4 mr-2 text-primary" />
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
