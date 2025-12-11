import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface UnifiedLayoutProps {
  header?: ReactNode;
  inputArea: ReactNode;
  outputArea: ReactNode;
  sidebar?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type LayoutMode = 'two-column' | 'single-column' | 'mobile-tabs';

export function UnifiedLayout({
  header,
  inputArea,
  outputArea,
  sidebar,
  className,
  children,
}: UnifiedLayoutProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('two-column');
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');

  // Determine layout mode based on viewport
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setLayoutMode('mobile-tabs');
      } else if (width < 1024) {
        setLayoutMode('single-column');
      } else {
        setLayoutMode('two-column');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Two-Column Layout (50/50 split: input | output)
  if (layoutMode === 'two-column') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Header */}
        {header && (
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-3">
              {header}
            </div>
          </div>
        )}

        {/* Main Content Area - 50/50 split */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Column - Input (50%) */}
          <div className="w-1/2 overflow-y-auto border-r">
            <div className="p-4">
              {inputArea}
            </div>
          </div>

          {/* Right Column - Output / Generated Posts (50%) */}
          <div className="w-1/2 overflow-y-auto bg-gray-50/30">
            <div className="p-4">
              {outputArea}
            </div>
          </div>
        </div>

        {/* Sidebar (toggleable overlay) */}
        {sidebar}

        {children}
      </div>
    );
  }

  // Tablet Two-Column Layout (50/50 split: input | output)
  if (layoutMode === 'single-column') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Header */}
        {header && (
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-3">
              {header}
            </div>
          </div>
        )}

        {/* Main Content Area - 50/50 split for tablet */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Column - Input (50%) */}
          <div className="w-1/2 overflow-y-auto border-r">
            <div className="p-4">
              {inputArea}
            </div>
          </div>

          {/* Right Column - Output / Generated Posts (50%) */}
          <div className="w-1/2 overflow-y-auto bg-gray-50/30">
            <div className="p-4">
              {outputArea}
            </div>
          </div>
        </div>

        {/* Sidebar (toggleable overlay) */}
        {sidebar}

        {children}
      </div>
    );
  }

  // Mobile Tab Layout
  return (
    <div className={cn('min-h-screen bg-background pb-16', className)}>
      {/* Header */}
      {header && (
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="px-4 py-3">
            {header}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-4 py-4">
        {mobileTab === 'input' ? (
          <div className="space-y-4">
            {inputArea}
          </div>
        ) : (
          <div className="space-y-4">
            {outputArea}
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setMobileTab('input')}
            className={cn(
              "py-3 text-center transition-colors",
              mobileTab === 'input'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="text-sm font-medium">Input</span>
          </button>
          <button
            onClick={() => setMobileTab('output')}
            className={cn(
              "py-3 text-center transition-colors",
              mobileTab === 'output'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="text-sm font-medium">Output</span>
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

// Layout Context Provider for nested components
import { createContext, useContext } from 'react';

interface LayoutContextValue {
  mode: LayoutMode;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within UnifiedLayout');
  }
  return context;
}

// Enhanced version with context provider
export function UnifiedLayoutWithContext(props: UnifiedLayoutProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('two-column');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setLayoutMode('mobile-tabs');
      } else if (width < 1024) {
        setLayoutMode('single-column');
      } else {
        setLayoutMode('two-column');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contextValue: LayoutContextValue = {
    mode: layoutMode,
    isMobile: layoutMode === 'mobile-tabs',
    isTablet: layoutMode === 'single-column',
    isDesktop: layoutMode === 'two-column',
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      <UnifiedLayout {...props} />
    </LayoutContext.Provider>
  );
}