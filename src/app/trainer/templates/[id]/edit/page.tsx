import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import CreateTemplateForm, {
  TEMPLATE_FORM_ID,
} from "@/components/trainer/CreateTemplateForm";
import {
  MOCK_EDIT_TEMPLATE_VALUES,
  MOCK_EDIT_TEMPLATE_EXERCISES,
  MOCK_EDIT_TEMPLATE_META,
} from "@/mock/trainer/createTemplateData";

// In a real integration this page would read `params.templateId`, fetch the
// template server-side (DB/API), and pass the result down as initialValues /
// initialExercises / meta — same shape as the mock data below.
export default function EditTemplatePage() {
  const template = MOCK_EDIT_TEMPLATE_VALUES;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Edit Template
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update the workout template, exercises, and training
              configuration.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/trainer/templates">
              <Button
                type="button"
                variant="outline"
                className={bigSquareButton}
              >
                Cancel
              </Button>
            </Link>
            {/* type="submit" + form="..." lets this button, which lives
                outside the <form> element, submit the client-side form
                without this component needing to be a client component. */}
            <Button
              type="submit"
              form={TEMPLATE_FORM_ID}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <CreateTemplateForm
          mode="edit"
          initialValues={MOCK_EDIT_TEMPLATE_VALUES}
          initialExercises={MOCK_EDIT_TEMPLATE_EXERCISES}
          meta={MOCK_EDIT_TEMPLATE_META}
        />
      </main>
    </div>
  );
}
