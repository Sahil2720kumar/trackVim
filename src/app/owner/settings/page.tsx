import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsForm, {
  SETTINGS_FORM_ID,
} from "@/components/owner/SettingsForm";
import { bigSquareButton } from "@/lib/styles";

export default function SettingsPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <SettingsIcon className="w-6 h-6 text-primary shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  Settings
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your gym information, branding, business details, and GST
                settings.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              form={SETTINGS_FORM_ID}
              className={bigSquareButton}
            >
              Reset Changes
            </Button>
            {/* type="submit" + form="..." lets this button, which lives
                outside the <form> element, submit the client-side form
                without this component needing to be a client component. */}
            <Button
              type="submit"
              form={SETTINGS_FORM_ID}
              className={bigSquareButton}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <SettingsForm />
      </main>
    </div>
  );
}
