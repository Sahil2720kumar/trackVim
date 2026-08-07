// components/member/apply-steps/ProgressBar.tsx
import { CheckCircle2 } from "lucide-react";

function ProgressStep({
  step,
  status,
}: {
  step: number;
  status: "done" | "active" | "upcoming";
}) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 shrink-0 transition-all ${
        status === "done"
          ? "bg-primary/10 border-primary text-primary"
          : status === "active"
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-muted border-border text-muted-foreground"
      }`}
    >
      {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : step}
    </div>
  );
}

export default function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: "Choose Plan" },
    { n: 2, label: "Review Application" },
    { n: 3, label: "Awaiting Approval" },
    { n: 4, label: "Payment" },
  ] as const;

  return (
    <div className="w-full">
      {/* Circles + Lines */}
      <div className="flex items-center w-full">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`flex items-center ${
              i === steps.length - 1 ? "" : "flex-1"
            }`}
          >
            <ProgressStep
              step={s.n}
              status={
                s.n < step ? "done" : s.n === step ? "active" : "upcoming"
              }
            />

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  s.n < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {steps.map((s) => (
          <div key={s.n} className="w-9 flex flex-col items-center">
            <span
              className={`text-xs text-center whitespace-nowrap ${
                s.n <= step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
