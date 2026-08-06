import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Crown } from "lucide-react";

interface MembershipPlanCardProps {
  plan: {
    name: string;
    tier?: string;
    duration: string;
    price: number;
    joiningFee?: number;
    currency: string;
    period: string;
    benefits: string[];
  };
}

export function MembershipPlanCard({ plan }: MembershipPlanCardProps) {
  const hasJoiningFee = !!plan.joiningFee && plan.joiningFee > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Selected Membership Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-lg">
                    {plan.name}
                  </span>
                  {plan.tier && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      {plan.tier}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{plan.duration}</span>
                </div>

                <div className="mt-2 space-y-0.5">
                  <p className="text-3xl font-bold text-foreground">
                    {plan.currency}
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </p>
                  {hasJoiningFee && (
                    <p className="text-sm text-muted-foreground">
                      + {plan.currency}
                      {plan.joiningFee!} one-time joining fee
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
