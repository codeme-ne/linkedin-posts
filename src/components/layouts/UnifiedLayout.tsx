import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnifiedLayoutProps {
  header?: ReactNode;
  inputArea: ReactNode;
  outputArea: ReactNode;
  sidebarArea?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type LayoutMode = 'two-column' | 'single-column' | 'mobile-tabs';

export function UnifiedLayout({
  header,
  inputArea,
  outputArea,
  sidebarArea,
  className,
  children,
}: UnifiedLayoutProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('two-column');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Desktop Two-Column Layout
  if (layoutMode === 'two-column') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Header */}
        {header && (
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              {header}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
          <div className="flex gap-6">
            {/* Main Content - Takes 2/3 of available space */}
            <div className="flex-[2]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Column */}
                <div className="lg:col-span-1">
                  {inputArea}
                </div>

                {/* Output Column */}
                <div className="lg:col-span-1">
                  {outputArea}
                </div>
              </div>
            </div>

            {/* Sidebar - Takes 1/3 of available space */}
            {sidebarArea && (
              <div className={cn(
                "hidden lg:block flex-1 transition-all duration-300",
                sidebarCollapsed ? "w-14" : "min-w-[320px] max-w-md"
              )}>
                <div className="sticky top-20 h-[calc(100vh-5rem)] border-l bg-background flex flex-col">
                  {/* Sidebar Header with Toggle Button */}
                  <div className="flex items-center justify-between p-2 border-b">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {sidebarCollapsed ? <ChevronLeft /> : <ChevronRight />}
                    </Button>
                    {!sidebarCollapsed && (
                      <h3 className="text-sm font-semibold px-2">Saved Posts</h3>
                    )}
                  </div>
                  {/* Sidebar Content */}
                  <div className={cn(
                    "flex-1 overflow-y-auto",
                    sidebarCollapsed && "hidden"
                  )}>
                    {sidebarArea}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    );
  }

  // Tablet Single-Column Layout
  if (layoutMode === 'single-column') {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Header */}
        {header && (
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              {header}
            </div>
          </div>
        )}

        {/* Main Content - Single Column */}
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="space-y-8">
            {/* Input Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Input</h2>
              {inputArea}
            </section>

            {/* Output Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Generated Content</h2>
              {outputArea}
            </section>
          </div>
        </div>

        {/* Sidebar as overlay on tablet */}

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