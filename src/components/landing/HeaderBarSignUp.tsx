import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

type HeaderBarSignUpProps = {
  isVisible: boolean;
  onBack: () => void;
};

export function HeaderBarSignUp({ isVisible, onBack }: HeaderBarSignUpProps) {
  return (
    <header className={`flex justify-between items-center py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <Logo 
        className="w-8 h-8 sm:w-10 sm:h-10 shadow-lg rounded-xl" 
        showText={true} 
        textClassName="font-bold text-lg sm:text-2xl tracking-tight"
      />
      <Button 
        variant="outline" 
        className="border-primary/30 hover:border-primary/60 transition-all duration-300"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück
      </Button>
    </header>
  );
}