/**
 * Example: How to use the non-blocking regeneration confirmation pattern
 *
 * This file demonstrates how a component should integrate with the updated
 * useEnhancedContentGeneration hook to handle regeneration confirmations
 * via AlertDialog instead of window.confirm().
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEnhancedContentGeneration } from '@/hooks/useEnhancedContentGeneration';

export function ExampleComponent() {
  const {
    pendingRegeneration,
    confirmRegeneration,
    cancelRegeneration,
    regenerateEnhancedPost,
    // ... other hook methods
  } = useEnhancedContentGeneration();

  const handleRegenerate = async () => {
    await regenerateEnhancedPost(
      'some content',
      'linkedin',
      'thought_leadership'
    );
    // If post is edited, pendingRegeneration state will be set
    // If not edited, regeneration happens immediately
  };

  return (
    <>
      <button onClick={handleRegenerate}>
        Regenerieren
      </button>

      {/* Render AlertDialog when pendingRegeneration is set */}
      <AlertDialog open={!!pendingRegeneration} onOpenChange={(open) => {
        if (!open) cancelRegeneration();
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Änderungen überschreiben?</AlertDialogTitle>
            <AlertDialogDescription>
              Das Regenerieren überschreibt Ihre Änderungen. Fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRegeneration}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegeneration}>
              Fortfahren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
