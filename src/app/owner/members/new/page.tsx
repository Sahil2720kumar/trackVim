import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MemberForm, { MEMBER_FORM_ID } from "@/components/owner/MemberForm";
import { bigSquareButton } from "@/lib/styles";

export default function AddNewMemberPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className=" py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button> */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                Add New Member
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Register a new member to your gym.
              </p>
            </div>
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
              form={MEMBER_FORM_ID}
              className={bigSquareButton}
            >
              Save Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <MemberForm />
      </main>
    </div>
  );
}
