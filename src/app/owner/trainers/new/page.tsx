import { Button } from "@/components/ui/button";
import { bigSquareButton } from "@/lib/styles";
import TrainerForm, { TRAINER_FORM_ID } from "@/components/owner/TrainerForm";

export default function AddNewTrainerPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border py-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Add New Trainer
            </h1>
            <p className="text-muted-foreground mt-1">
              Register a trainer and send an invitation to join your gym.
            </p>
          </div>
          <div className="flex w-full gap-3 sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={`${bigSquareButton} flex-1 sm:flex-none`}
            >
              Cancel
            </Button>
            {/* type="submit" + form="..." lets this button, which lives
                outside the <form> element, submit the client-side form
                without this component needing to be a client component. */}
            <Button
              type="submit"
              form={TRAINER_FORM_ID}
              className={`${bigSquareButton} flex-1 sm:flex-none`}
            >
              Create Trainer
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <TrainerForm />
    </div>
  );
}
