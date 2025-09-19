import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
  defaultSnapPoint?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  maxHeight?: string;
  enableBackdrop?: boolean;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  defaultSnapPoint = 0,
  showHandle = true,
  showCloseButton = true,
  className,
  contentClassName,
  maxHeight = '90vh',
  enableBackdrop = true,
}: MobileBottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const controls = useAnimation();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get the height for current snap point
  const getSnapHeight = (snapPoint: number) => {
    return `${snapPoint * 100}%`;
  };

  // Animate sheet when opening/closing
  useEffect(() => {
    if (isOpen && isMobile) {
      controls.start({
        y: 0,
        transition: { type: 'spring', damping: 30, stiffness: 400 },
      });
    } else {
      controls.start({
        y: '100%',
        transition: { type: 'spring', damping: 30, stiffness: 400 },
      });
    }
  }, [isOpen, isMobile, controls]);

  // Handle drag end to snap to points
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 200);

    if (shouldClose) {
      controls.start({
        y: '100%',
        transition: { type: 'spring', damping: 30, stiffness: 400 },
      });
      onClose();
    } else {
      // Find nearest snap point
      const draggedFraction = 1 - (info.point.y / window.innerHeight);
      let nearestSnapPoint = 0;
      let minDistance = Infinity;

      snapPoints.forEach((point, index) => {
        const distance = Math.abs(point - draggedFraction);
        if (distance < minDistance) {
          minDistance = distance;
          nearestSnapPoint = index;
        }
      });

      setCurrentSnapPoint(nearestSnapPoint);
      controls.start({
        y: 0,
        height: getSnapHeight(snapPoints[nearestSnapPoint]),
        transition: { type: 'spring', damping: 30, stiffness: 400 },
      });
    }
  };

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {enableBackdrop && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black z-40"
        />
      )}

      {/* Bottom Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ height: getSnapHeight(snapPoints[currentSnapPoint]), maxHeight }}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-lg z-50",
          "flex flex-col",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Bottom sheet"}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain p-4",
            contentClassName
          )}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}

// Hook to easily manage bottom sheet state
export function useMobileBottomSheet(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}