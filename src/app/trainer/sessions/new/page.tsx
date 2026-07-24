import { Button } from "@/components/ui/button";
import CreateSessionForm, {
  SESSION_FORM_ID,
} from "@/components/trainer/CreateSessionForm";
import { bigSquareButton } from "@/lib/styles";

export default function CreateTrainingSessionPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              Create New Session
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select a workout template and configure session details. Exercises
              will be added automatically.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button variant="outline" className={bigSquareButton}>
              Cancel
            </Button>
            {/* type="submit" + form="..." lets this button, which lives
                outside the <form> element, submit the client-side form
                without this component needing to be a client component. */}
            <Button
              type="submit"
              form={SESSION_FORM_ID}
              className={bigSquareButton}
            >
              Create Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <CreateSessionForm />
      </main>
    </div>
  );
}
