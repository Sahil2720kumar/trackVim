// owner-notes.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function OwnerNotes({ owner }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Owner Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {owner.note}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
