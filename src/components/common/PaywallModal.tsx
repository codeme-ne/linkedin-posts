import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Check } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const handleUpgrade = () => {
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else {
      console.error('Stripe payment link not configured');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Pro-Feature entdeckt! 🚀
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <Lock className="w-12 h-12 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
            <p className="font-semibold">Beta Lifetime Deal - nur 99€</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Einmalig zahlen, für immer nutzen
            </p>
          </div>
          
          <div className="space-y-2 text-left">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Mit Pro erhalten Sie:
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Unbegrenzte Posts generieren</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Posts speichern & verwalten</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Direct-Posting zu Social Media</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Premium URL-Extraktion</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Alle zukünftigen Features</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              className="flex-1"
            >
              Später
            </Button>
            <Button 
              onClick={handleUpgrade} 
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              Jetzt upgraden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}