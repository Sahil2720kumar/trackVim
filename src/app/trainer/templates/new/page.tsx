// app/trainer/templates/create/page.tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";

import CreateTemplateForm, {
  TEMPLATE_FORM_ID,
} from "@/components/trainer/CreateTemplateForm";

export default function CreateTemplatePage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Create Workout Template
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Build reusable workout templates that can be assigned to future
              training sessions.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/trainer/templates">
              <Button
                type="button"
                variant="outline"
                className={bigSquareButton}
              >
                <ChevronLeft className="size-4 mr-2" />
                Back to Templates
              </Button>
            </Link>
            <Button
              type="submit"
              form={TEMPLATE_FORM_ID}
              className={bigSquareButton}
            >
              Save Template
            </Button>
          </div>
        </div>
      </div>

      <main className="py-4">
        <CreateTemplateForm />
      </main>
    </div>
  );
}
