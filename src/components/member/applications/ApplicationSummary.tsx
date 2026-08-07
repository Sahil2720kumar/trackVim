import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import Image from "next/image";

function getStatusConfig(status) {
  const configs = {
    pending_review: {
      label: "Pending Review",
      color:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    approved_awaiting_payment: {
      label: "Approved · Awaiting Payment",
      color: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
    },
    payment_pending: {
      label: "Payment Pending",
      color: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
    },
    payment_uploaded: {
      label: "Payment Uploaded",
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      dot: "bg-blue-500",
    },
    payment_rejected: {
      label: "Payment Rejected",
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
      dot: "bg-red-500",
    },
    payment_verified: {
      label: "Active Member",
      color:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: "Rejected",
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
      dot: "bg-red-500",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground",
    },
  };
  return configs[status] ?? configs.pending_review;
}

// Builds a single-line address string from whichever address parts exist,
// so the UI never shows a hardcoded placeholder location.
function formatAddress(gym) {
  const parts = [
    gym.address_line1,
    gym.address_line2,
    gym.city,
    gym.state,
    gym.postal_code,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

// Initials fallback for gyms without a logo_url, e.g. "Ironforge Fitness" -> "IF"
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function ApplicationSummary({ status, gym, application }) {
  const statusConfig = getStatusConfig(status);
  const address = formatAddress(gym);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Application Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
            {gym.logo_url ? (
              <Image
                src={gym.logo_url}
                alt={`${gym.name} logo`}
                className="w-full h-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {getInitials(gym.name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-foreground">{gym.name}</h3>
              {gym.is_verified && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30 bg-primary/5 gap-1 py-0.5"
                >
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
            {address && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{address}</span>
              </div>
            )}
            <div className="flex items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground flex-wrap">
              {gym.contact_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {gym.contact_phone}
                </span>
              )}
              {gym.contact_email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {gym.contact_email}
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: <FileText className="w-4 h-4" />,
              label: "Application ID",
              value: application.id,
            },
            {
              icon: <CalendarDays className="w-4 h-4" />,
              label: "Applied On",
              value: application.applicationDate,
            },
            {
              icon: <BadgeCheck className="w-4 h-4" />,
              label: "Reviewed By",
              value: application.reviewedBy,
            },
            {
              icon: (
                <div
                  className={`w-2 h-2 rounded-full mt-0.5 ${statusConfig.dot}`}
                />
              ),
              label: "Current Status",
              value: (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              ),
            },
            {
              icon: <CalendarDays className="w-4 h-4" />,
              label: "Approved On",
              value: application.approvedDate,
            },
            {
              icon: <MessageSquare className="w-4 h-4" />,
              label: "Review Message",
              value: application.reviewMessage,
            },
          ]
            .filter((item) => item.value)
            .map((item, i) => (
              <div key={i} className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                {typeof item.value === "string" ? (
                  <p className="text-sm font-medium text-foreground break-words">
                    {item.value}
                  </p>
                ) : (
                  item.value
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
