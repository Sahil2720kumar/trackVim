import { LANGUAGES } from "@/constants/profile-options";
import { CheckCircle2, LanguagesIcon, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function LanguagePicker({
  selected,
  onToggle,
  onAdd,
}: {
  selected: string[];
  onToggle: (value: string) => void;
  onAdd: (value: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");

  const handleAdd = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setCustomValue("");
  };

  const presetNames = LANGUAGES.map((l) => l.name.toLowerCase());
  const customLanguages = selected.filter(
    (lang) => !presetNames.includes(lang.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {LANGUAGES.map(({ name, native }) => {
          const isSelected = selected.includes(name);
          return (
            <button
              type="button"
              key={name}
              onClick={() => onToggle(name)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-md ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <LanguagesIcon className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground truncate">
                  {name}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                  {native}
                </span>
              </span>
              {isSelected && (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 ml-auto" />
              )}
            </button>
          );
        })}

        {/* Custom languages the trainer added manually — same card
            treatment as presets so they read as "already selected"
            rather than disappearing after being added. */}
        {customLanguages.map((name) => (
          <button
            type="button"
            key={name}
            onClick={() => onToggle(name)}
            aria-pressed
            className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left border-primary bg-primary/5 ring-1 ring-primary"
          >
            <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md bg-primary text-primary-foreground">
              <LanguagesIcon className="w-3.5 h-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground truncate">
                {name}
              </span>
              <span className="block text-xs text-muted-foreground truncate">
                Custom
              </span>
            </span>
            <X className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-auto hover:text-destructive" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add another language..."
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!customValue.trim()}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
