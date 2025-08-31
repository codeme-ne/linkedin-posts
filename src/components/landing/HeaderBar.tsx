import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type HeaderBarProps = {
  isVisible: boolean;
  onSignup: () => void;
};

export function HeaderBar({ isVisible, onSignup }: HeaderBarProps) {
  return (
    <header className={`flex justify-between items-center py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <Logo 
        className="w-10 h-10 shadow-lg rounded-xl" 
        showText={true} 
        textClassName="font-bold text-2xl tracking-tight"
      />
      <Button 
        variant="outline" 
        className="border-primary/30 hover:border-primary/60 transition-all duration-300"
        onClick={onSignup}
      >
        Anmelden
      </Button>
    </header>
  );
}
