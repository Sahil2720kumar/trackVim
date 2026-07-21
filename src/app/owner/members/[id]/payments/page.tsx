"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Wallet,
  Receipt,
  Calendar,
  Download,
  Bell,
  Clock,
  CheckCircle,
  ArrowLeft,
  FileText,
  Mail,
  X,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RevenueAnalyticsChart } from "@/components/owner/RevenueAnalyticsChart";
import { PieChartCard } from "@/components/PieChartCard";
import { bigSquareButton } from "@/lib/styles";
import { MemberPaymentsTable } from "@/components/owner/Memberpaymentstable";
import {
  type Payment,
  exportCSV,
  initialPayments,
  revenueData,
  paymentMethodsData,
  initialTransactions,
} from "@/mock/memberPayments";

import { QuickActionsGrid } from "@/components/QuickActionsGrid";
import { memberBillingQuickActions } from "@/components/owner/quick-actions-data";

export default function PaymentsPage() {
  // ---- data state ----
  const payments = initialPayments;
  const transactions = initialTransactions;

  const totalPaid = 28500;
  const outstanding = 2000;
  const lastPaymentDate = "12 Jul 2026";
  const nextDueDate = "12 Aug 2026";
  const daysRemaining = 18;
  const reminderStatus = "Reminder Scheduled";

  // ---- actions ----
  function handleBackToProfile() {
    console.log("Back to member profile");
  }

  function handleExportPayments() {
    exportCSV(payments, "payments.csv");
    console.log("Payments exported");
  }

  function handleSendReminder() {
    console.log("Reminder sent to Rohan Sharma");
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Member Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
                Rohan Sharma
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                ID: MB-1024 | Gold Plan | Member Since: 12 Jan 2025
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Active Member
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {Number(outstanding) <= 0
                  ? "Payments Up-to-date"
                  : "Payment Due"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:flex-nowrap">
          <Button
            variant="outline"
            onClick={handleBackToProfile}
            className={`${bigSquareButton} w-full sm:w-auto col-span-2 sm:col-span-1`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPayments}
            className={`${bigSquareButton} w-full sm:w-auto`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Payments
          </Button>
          <Button
            //onClick={handleRecordPaymentClick}
            className={`${bigSquareButton} w-full sm:w-auto bg-primary`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CreditCard}
          title="Total Paid"
          value={`₹${Number(totalPaid).toLocaleString("en-IN")}`}
          subtitle="Lifetime Payments"
          trend={{ value: "+12%", positive: true }}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Wallet}
          title="Outstanding Balance"
          value={`₹${Number(outstanding).toLocaleString("en-IN")}`}
          subtitle="Balance Due"
          trend={{ value: "-4%", positive: false }}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={Calendar}
          title="Next Due"
          value={nextDueDate}
          subtitle={`${daysRemaining} Days Remaining`}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Payment Success Rate"
          value="100%"
          subtitle="All payments on time"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Revenue Analytics & Payment Summary */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <RevenueAnalyticsChart data={revenueData} />

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 px-4 sm:px-6">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Current Plan
              </span>
              <span className="text-sm font-semibold">Gold Plan</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Membership Fee
              </span>
              <span className="text-sm font-semibold">₹2,000/month</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Discount</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                -₹200
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Tax (18%)</span>
              <span className="text-sm font-semibold">₹324</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Last Payment
              </span>
              <span className="text-sm font-semibold">{lastPaymentDate}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Next Due Date
              </span>
              <span className="text-sm font-semibold text-orange-600">
                {nextDueDate}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Outstanding Balance
              </span>
              <Badge
                variant="secondary"
                className={
                  Number(outstanding) <= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }
              >
                ₹{Number(outstanding).toLocaleString("en-IN")}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Auto Renewal
              </span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Enabled
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Payment Status
              </span>
              <Badge
                variant="secondary"
                className={
                  Number(outstanding) <= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }
              >
                {Number(outstanding) <= 0 ? "Paid" : "Due"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Due & Revenue Insights */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Upcoming Due</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg">
                  Membership Renewal
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gold Plan Monthly Membership
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-semibold mt-1 sm:text-base">
                      {nextDueDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-semibold mt-1 sm:text-base">
                      ₹2,000
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground">
                      Days Remaining
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800"
                    >
                      {daysRemaining} Days
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(100, (daysRemaining / 30) * 100)}
                    className="h-2"
                  />
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    Reminder Status: {reminderStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              <Button
                className="w-full sm:w-auto sm:flex-1"
                // onClick={handleRecordPaymentClick}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto sm:flex-1"
                onClick={handleSendReminder}
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Revenue Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  Payments This Month
                </p>
                <p className="text-sm font-semibold">₹2,000</p>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  Payments This Year
                </p>
                <p className="text-sm font-semibold">₹24,000</p>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  Average Monthly Revenue
                </p>
                <p className="text-sm font-semibold">₹2,150</p>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Renewal Rate</p>
                <p className="text-sm font-semibold text-green-600">96%</p>
              </div>
              <Progress value={96} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters and Payment History Table live in MemberPaymentsTable */}
      <MemberPaymentsTable payments={payments} />

      {/* Payment Methods & Recent Transactions */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <PieChartCard
          title="Payment Methods"
          data={paymentMethodsData}
          height={250}
          outerRadius={80}
          innerRadius={0}
          showTooltip
          showSliceLabels
          legendFormat="countAndPercent"
          className="rounded-lg p-6"
        />

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
            {transactions.slice(0, 6).map((transaction, index) => {
              const Icon = transaction.icon;
              return (
                <div
                  key={index}
                  className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="p-2 bg-blue-100 rounded-lg h-fit shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {transaction.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {transaction.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <QuickActionsGrid actions={memberBillingQuickActions} columns={4} />
        </CardContent>
      </Card>
    </div>
  );
}
