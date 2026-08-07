import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Mail, Phone } from "lucide-react";

interface HelpCardProps {
  gym: {
    contact_phone?: string | null;
    contact_email?: string | null;
  };
}

export function HelpCard({ gym }: HelpCardProps) {
  const hasPhone = Boolean(gym.contact_phone);
  const hasEmail = Boolean(gym.contact_email);
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Headphones className="w-4 h-4 text-primary" />
          Need Help?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Contact the gym for any assistance.
        </p>

        {!hasPhone && !hasEmail ? (
          <p className="text-sm text-muted-foreground italic">
            No contact details available for this gym yet.
          </p>
        ) : (
          <div className="space-y-2">
            {hasPhone && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{gym.contact_phone}</span>
              </div>
            )}
            {hasEmail && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{gym.contact_email}</span>
              </div>
            )}
          </div>
        )}

        {hasPhone && (
          <Button variant="outline" className="w-full mt-2" asChild>
            <a
              className="flex flex-row items-center justify-center gap-x-2"
              href={`tel:${gym.contact_phone}`}
            >
              <Phone className="w-4 h-4" />
              Contact Gym
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
