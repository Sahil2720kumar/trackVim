import { TemplatesPageClient } from "@/components/trainer/templates/TemplatesPageClient";

function TemplatesHeader() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Workout Templates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create reusable workout templates to quickly build training sessions.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* <Button variant="outline" className={bigSquareButton}>
          <Download className="mr-2 size-4" />
          Import Template
        </Button>
        <Button className={bigSquareButton}>
          <Plus className="mr-2 size-4" />
          Create Template
        </Button> */}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <TemplatesHeader />
      <TemplatesPageClient />
    </div>
  );
}
