import { cn } from '@/lib/utils';

// Skeleton loader variations for different layouts
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card animate-pulse",
        className
      )}
    >
      <div className="p-6 space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPost({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 animate-pulse",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-4/5" />
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-3 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({
  count = 3,
  className
}: {
  count?: number;
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border animate-pulse">
          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-10 bg-muted rounded-md animate-pulse",
        className
      )}
    />
  );
}

export function SkeletonInput({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-10 bg-muted rounded-md animate-pulse",
        className
      )}
    />
  );
}

export function SkeletonAvatar({
  size = "md",
  className
}: {
  size?: "sm" | "md" | "lg";
  className?: string
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return (
    <div
      className={cn(
        "bg-muted rounded-full animate-pulse",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className
}: {
  lines?: number;
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-muted rounded animate-pulse",
            i === lines - 1 && lines > 1 && "w-4/5"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonNavigation({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between p-4", className)}>
      <div className="flex items-center gap-4">
        <div className="w-32 h-8 bg-muted rounded animate-pulse" />
        <div className="hidden md:flex items-center gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className
}: {
  rows?: number;
  cols?: number;
  className?: string
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4 border-b">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="flex gap-4">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-3 bg-muted rounded animate-pulse flex-1"
                    style={{
                      animationDelay: `${(rowIndex * cols + colIndex) * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading state props
interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  className?: string;
}

/**
 * @deprecated Use simple button spinner instead
 */
export function DeprecatedExtractingContent({
  message = "Analysiere Content...",
  subMessage = "Dies kann bis zu 30 Sekunden dauern",
  progress,
  className
}: LoadingStateProps) {
  // Log deprecation warning
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('DeprecatedExtractingContent is deprecated. Please use a simple button spinner instead.');
  }

  const steps = [
    "Lade Webseite...",
    "Extrahiere Hauptinhalt...",
    "Bereinige Formatierung...",
    "Optimiere für KI-Verarbeitung..."
  ];

  const currentStep = progress ? Math.floor((progress / 100) * steps.length) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 animate-pulse">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-medium">{message}</h3>
        <p className="text-sm text-muted-foreground">{subMessage}</p>
      </div>

      {progress !== undefined && (
        <div className="w-full max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Fortschritt</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "text-sm text-center transition-colors duration-200",
              i < currentStep ? "text-primary" :
              i === currentStep ? "text-foreground animate-pulse" :
              "text-muted-foreground"
            )}
          >
            {i < currentStep && "✓ "}
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GeneratingContent({
  message = "Erstelle Posts...",
  subMessage,
  platform,
  className
}: LoadingStateProps & { platform?: string }) {
  const platformEmojis: Record<string, string> = {
    linkedin: '💼',
    x: '🐦',
    instagram: '📸',
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        {platform && (
          <div className="text-3xl animate-bounce">
            {platformEmojis[platform] || '✨'}
          </div>
        )}
        <h3 className="text-lg font-medium">{message}</h3>
        {subMessage && (
          <p className="text-sm text-muted-foreground">{subMessage}</p>
        )}
      </div>

      <div className="flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Backward compatibility aliases
export const ExtractingContent = DeprecatedExtractingContent;
export const GeneratingPosts = GeneratingContent;