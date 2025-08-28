import { UpgradeButton } from "@/components/UpgradeButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Du hast keine Transformationen mehr übrig
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Upgrade auf Pro für unbegrenzte Transformationen!
          </p>
          
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-semibold">Beta Lifetime Deal - nur 49€</p>
            <ul className="text-sm space-y-1">
              <li>✓ Unbegrenzte Transformationen</li>
              <li>✓ Alle Plattformen</li>
              <li>✓ Posts speichern</li>
              <li>✓ Lebenslanger Zugang</li>
            </ul>
          </div>
          
          <UpgradeButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}