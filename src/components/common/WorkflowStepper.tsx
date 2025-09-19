import { cn } from "@/lib/utils";
import { Check, FileText, Sparkles, Share2 } from "lucide-react";

export type WorkflowStep = 'input' | 'generate' | 'share';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  completedSteps?: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
  className?: string;
}

const steps = [
  {
    id: 'input' as WorkflowStep,
    label: 'Import Content',
    description: 'URL oder Text eingeben',
    icon: FileText,
  },
  {
    id: 'generate' as WorkflowStep,
    label: 'Posts generieren',
    description: 'KI erstellt Beiträge',
    icon: Sparkles,
  },
  {
    id: 'share' as WorkflowStep,
    label: 'Teilen & Speichern',
    description: 'Bearbeiten und verteilen',
    icon: Share2,
  },
];

export function WorkflowStepper({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: WorkflowStepperProps) {
  const getStepStatus = (stepId: WorkflowStep) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'current';
    return 'upcoming';
  };

  const getStepIndex = (stepId: WorkflowStep) => {
    return steps.findIndex(s => s.id === stepId);
  };

  const isStepClickable = (stepId: WorkflowStep) => {
    if (!onStepClick) return false;
    // Can click on completed steps or current step
    return completedSteps.includes(stepId) || currentStep === stepId;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop View */}
      <div className="hidden md:block">
        <nav aria-label="Workflow Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              const isClickable = isStepClickable(step.id);
              const isLast = index === steps.length - 1;

              return (
                <li key={step.id} className="relative flex-1">
                  <div
                    className={cn(
                      "flex flex-col items-center group",
                      isClickable && "cursor-pointer"
                    )}
                    onClick={() => isClickable && onStepClick?.(step.id)}
                  >
                    {/* Progress Line */}
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-[50%] right-[-50%] top-5 h-0.5 -z-10",
                          status === 'completed' ||
                          (status === 'current' && getStepIndex(step.id) < getStepIndex(currentStep))
                            ? "bg-primary"
                            : "bg-muted"
                        )}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        status === 'completed' && "border-primary bg-primary text-primary-foreground",
                        status === 'current' && "border-primary bg-background text-primary animate-pulse",
                        status === 'upcoming' && "border-muted bg-muted/30 text-muted-foreground",
                        isClickable && "group-hover:scale-110"
                      )}
                    >
                      {status === 'completed' ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                      <span className="absolute -top-2 -right-2">
                        {status === 'current' && (
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors",
                          status === 'current' && "text-primary",
                          status === 'completed' && "text-foreground",
                          status === 'upcoming' && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile View - Compact */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isClickable = isStepClickable(step.id);

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                    status === 'completed' && "border-primary bg-primary text-primary-foreground",
                    status === 'current' && "border-primary bg-background text-primary",
                    status === 'upcoming' && "border-muted bg-muted/30 text-muted-foreground",
                    isClickable && "active:scale-95"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      status === 'completed' ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Current Step Info */}
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-primary">
            {steps.find(s => s.id === currentStep)?.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}