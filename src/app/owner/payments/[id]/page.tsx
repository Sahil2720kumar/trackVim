"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  CheckCircle,
  FileText,
  Info,
  IndianRupee,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// npm install jspdf jspdf-autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PaymentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [isGSTRegistered] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock payment data
  const payment = {
    id: params.id,
    receiptNumber: "RCPT-2026-000245",
    paymentID: "PAY-983422",
    paymentDate: "20 Jul 2026, 10:45 AM",
    paymentMethod: "UPI",
    transactionReference: "UPI23892731",
    collectedBy: "Sahil Kumar",
    paymentStatus: "Paid",
    amountPaid: 2360,
    subtotal: 2000,
    discount: 200,
    discountPercentage: 10,
    tax: 360,
    outstandingBalance: 0,
  };

  const member = {
    id: "MBR-1024",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@email.com",
    status: "Active Member",
    memberSince: "15 Jan 2026",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  };

  const membership = {
    plan: "Premium Membership",
    category: "Premium",
    duration: "12 Months",
    startDate: "20 Jul 2026",
    expiryDate: "19 Jul 2027",
    joiningFee: 500,
    discount: "10%",
    finalAmount: 2360,
    features: [
      "Unlimited Gym Access",
      "Personal Trainer",
      "Diet Plan",
      "Locker Facility",
      "Steam Bath",
      "Workout Plan",
    ],
  };

  const gym = {
    name: "PowerFlex Gym",
    address: "123, Fitness Street, Guwahati Basist, Guwahati, Assam - 781005",
    phone: "+91 98765 43210",
    email: "info@powerflexgym.com",
  };

  const gstDetails = {
    gstin: "18ABCDE1234F1Z5",
    businessName: "PowerFlex Fitness Pvt. Ltd.",
    legalBusinessName: "PowerFlex Fitness Private Limited",
    billingAddress:
      "123, Fitness Street, Guwahati Basist, Guwahati, Assam - 781005",
    state: "Assam",
    stateCode: "18",
    placeOfSupply: "Assam (18)",
    sacCode: "99913 (Fitness Services)",
    invoiceNumber: "INV-2026-000245",
    invoiceDate: "20 Jul 2026",
    cgst: 180,
    sgst: 180,
    igst: 0,
  };

  const timeline = [
    {
      id: 1,
      event: "Membership Created",
      date: "18 Jul 2026",
      time: "09:15 AM",
      user: "Sahil Kumar",
      icon: FileText,
    },
    {
      id: 2,
      event: "Invoice Generated",
      date: "18 Jul 2026",
      time: "09:16 AM",
      user: "Sahil Kumar",
      icon: FileText,
    },
    {
      id: 3,
      event: "Payment Recorded",
      date: "20 Jul 2026",
      time: "10:45 AM",
      user: "Sahil Kumar",
      icon: CreditCard,
    },
    {
      id: 4,
      event: "Receipt Generated",
      date: "20 Jul 2026",
      time: "10:45 AM",
      user: "System",
      icon: CheckCircle,
    },
  ];

  // ---- Functional GST receipt PDF download ----
  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;
      let cursorY = 50;

      // Header: gym identity + receipt meta
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text(gym.name, marginX, cursorY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      cursorY += 16;
      doc.text(gym.address, marginX, cursorY, { maxWidth: 280 });
      cursorY += 26;
      doc.text(`Phone: ${gym.phone}`, marginX, cursorY);
      cursorY += 12;
      doc.text(`Email: ${gym.email}`, marginX, cursorY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 90, 31); // brand accent
      doc.text(
        isGSTRegistered ? "TAX INVOICE / RECEIPT" : "PAYMENT RECEIPT",
        pageWidth - marginX,
        50,
        { align: "right" },
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const metaLines = [
        `Receipt No: ${payment.receiptNumber}`,
        `Payment Date: ${payment.paymentDate}`,
        `Status: ${payment.paymentStatus}`,
      ];
      if (isGSTRegistered) {
        metaLines.push(`Invoice No: ${gstDetails.invoiceNumber}`);
        metaLines.push(`Invoice Date: ${gstDetails.invoiceDate}`);
      }
      let metaY = 70;
      metaLines.forEach((line) => {
        doc.text(line, pageWidth - marginX, metaY, { align: "right" });
        metaY += 13;
      });

      cursorY = Math.max(cursorY, metaY) + 20;
      doc.setDrawColor(220, 220, 220);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 20;

      // Bill To
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("BILL TO", marginX, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(member.name, marginX, cursorY);
      cursorY += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`Member ID: ${member.id}`, marginX, cursorY);
      cursorY += 12;
      doc.text(`${member.phone}  |  ${member.email}`, marginX, cursorY);
      cursorY += 24;

      // GST business details block
      if (isGSTRegistered) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        doc.text("GST DETAILS", marginX, cursorY);
        cursorY += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const gstLines = [
          `GSTIN: ${gstDetails.gstin}`,
          `Legal Name: ${gstDetails.legalBusinessName}`,
          `Place of Supply: ${gstDetails.placeOfSupply}`,
          `SAC Code: ${gstDetails.sacCode}`,
        ];
        gstLines.forEach((line) => {
          doc.text(line, marginX, cursorY);
          cursorY += 13;
        });
        cursorY += 8;
      }

      // Line items table
      autoTable(doc, {
        startY: cursorY,
        head: [
          isGSTRegistered
            ? ["Description", "Amount", "Discount", "CGST", "SGST", "Total"]
            : ["Description", "Amount", "Discount", "Total"],
        ],
        body: [
          isGSTRegistered
            ? [
                membership.plan,
                `INR ${payment.subtotal}`,
                `- INR ${payment.discount}`,
                `INR ${gstDetails.cgst}`,
                `INR ${gstDetails.sgst}`,
                `INR ${payment.amountPaid}`,
              ]
            : [
                membership.plan,
                `INR ${payment.subtotal}`,
                `- INR ${payment.discount}`,
                `INR ${payment.amountPaid}`,
              ],
        ],
        theme: "grid",
        headStyles: { fillColor: [255, 90, 31], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        margin: { left: marginX, right: marginX },
      });

      // @ts-expect-error - lastAutoTable is added by the plugin at runtime
      let afterTableY = doc.lastAutoTable.finalY + 24;

      // Totals block (right aligned)
      const totalsX = pageWidth - marginX;
      const totalRows: [string, string][] = [
        ["Subtotal", `INR ${payment.subtotal}`],
        [
          `Discount (${payment.discountPercentage}%)`,
          `- INR ${payment.discount}`,
        ],
      ];
      if (isGSTRegistered) {
        totalRows.push(["CGST", `INR ${gstDetails.cgst}`]);
        totalRows.push(["SGST", `INR ${gstDetails.sgst}`]);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      totalRows.forEach(([label, value]) => {
        doc.text(label, totalsX - 140, afterTableY);
        doc.text(value, totalsX, afterTableY, { align: "right" });
        afterTableY += 14;
      });

      doc.setDrawColor(220, 220, 220);
      doc.line(totalsX - 140, afterTableY, totalsX, afterTableY);
      afterTableY += 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 90, 31);
      doc.text("Grand Total", totalsX - 140, afterTableY);
      doc.text(`INR ${payment.amountPaid}`, totalsX, afterTableY, {
        align: "right",
      });
      afterTableY += 30;

      // Payment details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text("PAYMENT DETAILS", marginX, afterTableY);
      afterTableY += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const payLines = [
        `Method: ${payment.paymentMethod}`,
        `Transaction Ref: ${payment.transactionReference}`,
        `Collected By: ${payment.collectedBy}`,
        `Outstanding Balance: INR ${payment.outstandingBalance}`,
      ];
      payLines.forEach((line) => {
        doc.text(line, marginX, afterTableY);
        afterTableY += 13;
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        isGSTRegistered
          ? "This document is a valid tax invoice under GST regulations."
          : "This document is an official payment receipt.",
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

      doc.save(`${payment.receiptNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View payment details, official receipt, and transaction history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="default" asChild className="flex-1">
            <Link href="/owner/payments" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
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
        </div>
      </div>

      {/* Main Content - 2 Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Information Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Receipt Number
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {payment.receiptNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment ID
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {payment.paymentID}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Date
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {payment.paymentDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    {payment.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Transaction Reference
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {payment.transactionReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Collected By
                  </p>
                  <p className="font-semibold text-foreground">
                    {payment.collectedBy}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {payment.paymentStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Amount Paid
                  </p>
                  <p className="font-bold text-2xl text-primary flex items-center gap-1 justify-end">
                    <IndianRupee className="w-5 h-5" />
                    {payment.amountPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Information Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Avatar className="w-16 h-16 ring-2 ring-border">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    ID: {member.id}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800"
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Phone
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {member.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {member.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="font-semibold text-foreground">
                    {member.memberSince}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Information Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Membership Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Membership Plan
                  </p>
                  <p className="font-bold text-foreground">{membership.plan}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Category
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    {membership.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Duration
                  </p>
                  <p className="font-semibold text-foreground">
                    {membership.duration}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Joining Fee
                  </p>
                  <p className="font-semibold text-foreground flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {membership.joiningFee}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Start Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {membership.startDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Expiry Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {membership.expiryDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Discount
                  </p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {membership.discount}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Final Amount
                  </p>
                  <p className="font-bold text-lg text-primary flex items-center">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {membership.finalAmount}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Included Features
                </p>
                <div className="flex flex-wrap gap-2">
                  {membership.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GST Information Card */}
          {isGSTRegistered ? (
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">GST Information</CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    GST Registered
                  </Badge>
                </div>
                <CardDescription>
                  Tax invoice details for GST registered gym.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      GSTIN
                    </p>
                    <p className="font-mono font-bold">{gstDetails.gstin}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      State
                    </p>
                    <p className="font-semibold">
                      {gstDetails.state} ({gstDetails.stateCode})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Business Name
                    </p>
                    <p className="font-semibold">{gstDetails.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Legal Business Name
                    </p>
                    <p className="font-semibold">
                      {gstDetails.legalBusinessName}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Billing Address
                    </p>
                    <p className="font-semibold flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      {gstDetails.billingAddress}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Invoice Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Invoice Number
                    </p>
                    <p className="font-mono font-bold">
                      {gstDetails.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Invoice Date
                    </p>
                    <p className="font-semibold">{gstDetails.invoiceDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Place of Supply
                    </p>
                    <p className="font-semibold">{gstDetails.placeOfSupply}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      SAC Code
                    </p>
                    <p className="font-mono font-semibold">
                      {gstDetails.sacCode}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Tax Breakdown Table */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-4">
                    Tax Breakdown
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border">
                          <th className="text-left py-2.5 px-3 font-semibold">
                            Description
                          </th>
                          <th className="text-right py-2.5 px-3 font-semibold">
                            Taxable Amount
                          </th>
                          <th className="text-right py-2.5 px-3 font-semibold">
                            CGST (9%)
                          </th>
                          <th className="text-right py-2.5 px-3 font-semibold">
                            SGST (9%)
                          </th>
                          <th className="text-right py-2.5 px-3 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-muted/50">
                          <td className="py-3 px-3">Premium Membership</td>
                          <td className="text-right py-3 px-3 font-semibold">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            {payment.subtotal}
                          </td>
                          <td className="text-right py-3 px-3 font-semibold">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            {gstDetails.cgst}
                          </td>
                          <td className="text-right py-3 px-3 font-semibold">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            {gstDetails.sgst}
                          </td>
                          <td className="text-right py-3 px-3 font-bold text-primary">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            {payment.amountPaid}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Taxable Amount
                      </span>
                      <span className="font-semibold">
                        <IndianRupee className="w-4 h-4 inline mr-1" />
                        {payment.subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total CGST</span>
                      <span className="font-semibold">
                        <IndianRupee className="w-4 h-4 inline mr-1" />
                        {gstDetails.cgst}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total SGST</span>
                      <span className="font-semibold">
                        <IndianRupee className="w-4 h-4 inline mr-1" />
                        {gstDetails.sgst}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Grand Total</span>
                      <span className="text-primary">
                        <IndianRupee className="w-5 h-5 inline mr-1" />
                        {payment.amountPaid}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-blue-500/5 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      GST Not Applicable
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This gym is not registered under GST. This receipt serves
                      as an official payment receipt and does not include tax
                      invoice information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6 ">
          {/* Payment Actions Card */}
          <Card className="border-border ">
            <CardHeader>
              <CardTitle className="text-lg">Payment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
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
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Receipt
              </Button>
              <Separator className="my-2" />
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                size="sm"
                disabled
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                size="sm"
                disabled
              >
                <Share2 className="w-4 h-4 mr-2" />
                Send WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 dark:text-red-400"
                size="sm"
                disabled
              >
                Refund Payment
              </Button>
            </CardContent>
          </Card>

          {/* Payment Status Card */}
          <Card className="border-emerald-200 bg-emerald-500/5 dark:border-emerald-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">
                Payment Status
              </CardTitle>

              <Badge className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-500">
                <CheckCircle className="h-3.5 w-3.5" />
                Paid
              </Badge>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Date
                  </span>

                  <span className="font-medium">{payment.paymentDate}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Method
                  </span>

                  <div className="flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {payment.paymentMethod}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Outstanding Balance
                  </span>

                  <div className="flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                    <IndianRupee className="mr-0.5 h-4 w-4" />
                    {payment.outstandingBalance}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-500/10 p-3 dark:border-emerald-900">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Payment Successful
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    This payment has been completed successfully. No outstanding
                    dues remain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Official Payment Receipt */}
      <Card className="border-border mb-6 bg-card print:bg-white print:border-0 print:shadow-none overflow-hidden">
        <div className="h-1.5 bg-primary print:hidden" />
        <CardContent className="p-8 print:p-0">
          {/* Receipt Header */}
          <div className="mb-8 pb-6 border-b border-border print:border-0">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{gym.name}</h2>
                <p className="text-sm text-muted-foreground flex items-start gap-2 mt-2 max-w-xs">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {gym.address}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {gym.phone}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {gym.email}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {isGSTRegistered ? "TAX INVOICE" : "PAYMENT RECEIPT"}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Receipt No:</span>{" "}
                    <span className="font-bold">{payment.receiptNumber}</span>
                  </p>
                  {isGSTRegistered && (
                    <p>
                      <span className="text-muted-foreground">Invoice No:</span>{" "}
                      <span className="font-bold">
                        {gstDetails.invoiceNumber}
                      </span>
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Payment Date:</span>{" "}
                    <span className="font-semibold">{payment.paymentDate}</span>
                  </p>
                  <p>
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      {payment.paymentStatus}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To + GST side by side */}
          <div className="mb-8 pb-6 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
                Bill To
              </p>
              <h4 className="font-bold text-lg mb-2">{member.name}</h4>
              <p className="text-sm text-muted-foreground">ID: {member.id}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {member.phone}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>
            </div>
            {isGSTRegistered && (
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
                  GST Details
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">GSTIN:</span>{" "}
                  <span className="font-mono font-semibold">
                    {gstDetails.gstin}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Legal Name:</span>{" "}
                  <span className="font-semibold">
                    {gstDetails.legalBusinessName}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    Place of Supply:
                  </span>{" "}
                  <span className="font-semibold">
                    {gstDetails.placeOfSupply}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">SAC Code:</span>{" "}
                  <span className="font-mono font-semibold">
                    {gstDetails.sacCode}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Receipt Table */}
          <div className="mb-8">
            <div className="overflow-x-auto rounded-xl border border-border mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="text-left py-3 px-3 font-semibold">
                      Description
                    </th>
                    <th className="text-center py-3 px-3 font-semibold">Qty</th>
                    <th className="text-right py-3 px-3 font-semibold">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-3 font-semibold">
                      Discount
                    </th>
                    {isGSTRegistered && (
                      <th className="text-right py-3 px-3 font-semibold">
                        GST (18%)
                      </th>
                    )}
                    <th className="text-right py-3 px-3 font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/50">
                    <td className="py-4 px-3">{membership.plan}</td>
                    <td className="text-center py-4 px-3">1</td>
                    <td className="text-right py-4 px-3 font-semibold">
                      <IndianRupee className="w-3 h-3 inline mr-1" />
                      {payment.subtotal}
                    </td>
                    <td className="text-right py-4 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      -<IndianRupee className="w-3 h-3 inline mr-1" />
                      {payment.discount}
                    </td>
                    {isGSTRegistered && (
                      <td className="text-right py-4 px-3 font-semibold">
                        <IndianRupee className="w-3 h-3 inline mr-1" />
                        {gstDetails.cgst + gstDetails.sgst}
                      </td>
                    )}
                    <td className="text-right py-4 px-3 font-bold text-primary">
                      <IndianRupee className="w-3 h-3 inline mr-1" />
                      {payment.amountPaid}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-full max-w-xs">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      {payment.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount ({payment.discountPercentage}%):
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      -<IndianRupee className="w-4 h-4 inline mr-1" />
                      {payment.discount}
                    </span>
                  </div>
                  {isGSTRegistered && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          CGST (9%):
                        </span>
                        <span className="font-semibold">
                          <IndianRupee className="w-4 h-4 inline mr-1" />
                          {gstDetails.cgst}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          SGST (9%):
                        </span>
                        <span className="font-semibold">
                          <IndianRupee className="w-4 h-4 inline mr-1" />
                          {gstDetails.sgst}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base text-primary">
                    <span>Grand Total:</span>
                    <span>
                      <IndianRupee className="w-5 h-5 inline mr-1" />
                      {payment.amountPaid}
                    </span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-bold">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      {payment.amountPaid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-bold">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      {payment.outstandingBalance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
              Payment Details
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold">{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  Transaction Reference
                </p>
                <p className="font-mono font-semibold">
                  {payment.transactionReference}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Collected By</p>
                <p className="font-semibold">{payment.collectedBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Date</p>
                <p className="font-semibold">{payment.paymentDate}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-2 p-4 bg-muted rounded-xl print:bg-white print:border print:border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Thank you for choosing {gym.name}!
            </p>
            {isGSTRegistered ? (
              <p className="text-xs text-muted-foreground">
                This document is a valid tax invoice under GST regulations.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This document is an official payment receipt.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              This receipt is computer generated and does not require a physical
              signature.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Timeline */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Payment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeline.map((event, index) => {
              const IconComponent = event.icon;
              return (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-border my-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-foreground">
                      {event.event}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {event.user}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" className="w-full mt-6">
            View All History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
