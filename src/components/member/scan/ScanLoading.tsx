import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "./BrandMark";

export default function ScanLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center gap-6">
        <BrandMark />
        <Card className="w-full rounded-3xl border-border/80 bg-card shadow-xl shadow-primary/5">
          <CardContent className="flex flex-col items-center px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex size-20 items-center justify-center rounded-full bg-brand/5 sm:size-24">
              <div
                className="size-12 animate-spin rounded-full border-4 border-primary/15 border-t-brand"
                aria-label="Loading"
              />
            </div>
            <h1 className="mt-6 text-center text-xl font-bold tracking-tight sm:text-2xl">
              Processing attendance
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
              Verifying your gym access...
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
