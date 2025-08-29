import { Button } from "@/components/ui/button";

type HeaderBarProps = {
  isVisible: boolean;
  onSignup: () => void;
};

export function HeaderBar({ isVisible, onSignup }: HeaderBarProps) {
  return (
    <header className={`flex justify-between items-center py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-primary to-accent text-white p-2 rounded-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7L9 19l-5.5-5.5" />
          </svg>
        </div>
        <h2 className="font-bold text-2xl tracking-tight">Social Transformer</h2>
      </div>
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
