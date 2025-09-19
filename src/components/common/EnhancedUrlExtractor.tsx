import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Link2,
  FileText,
  Sparkles,
  Loader2,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface EnhancedUrlExtractorProps {
  value: string;
  onContentExtracted: (url: string, usePremium: boolean) => void;
  onTextInput: (text: string) => void;
  isExtracting?: boolean;
  isPro?: boolean;
  usageRemaining?: number;
  usePremiumExtraction?: boolean;
  onPremiumToggle?: (enabled: boolean) => void;
  className?: string;
}

const EnhancedUrlExtractorComponent = ({
  value,
  onContentExtracted,
  onTextInput,
  isExtracting = false,
  isPro = false,
  usageRemaining,
  usePremiumExtraction = false,
  onPremiumToggle,
  className,
}: EnhancedUrlExtractorProps) => {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');

  // Use controlled premium state if provided, otherwise local state
  const usePremium = usePremiumExtraction;
  const setUsePremium = (enabled: boolean) => {
    onPremiumToggle?.(enabled);
  };

  const handleExtract = () => {
    if (!url.trim()) {
      toast.error('Bitte gib eine gültige URL ein');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error('Ungültiges URL-Format');
      return;
    }

    // Trigger extraction with premium flag
    onContentExtracted(url, usePremium);
  };

  const popularSources = [
    { name: 'Medium', icon: '📝', example: 'medium.com/@user/article' },
    { name: 'Substack', icon: '📬', example: 'newsletter.substack.com' },
    { name: 'LinkedIn', icon: '💼', example: 'linkedin.com/pulse/' },
    { name: 'Blog', icon: '🌐', example: 'yourblog.com/post' },
  ];

  return (
    <Card className={cn("border-2 border-primary/20 shadow-lg", className)}>
      <div className="p-6 space-y-6">
        {/* Header with Benefits */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl" />
              <Sparkles className="relative h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Content importieren</h2>
          </div>
          <p className="text-muted-foreground">
            Verwandle jeden Artikel in virale Social Media Posts
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">10k+ Posts erstellt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">5x mehr Reichweite</span>
          </div>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              URL importieren
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Text einfügen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-6">
            {/* URL Input Group */}
            <div className="space-y-3">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://example.com/artikel"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  className="pl-10 pr-4 h-12 text-base"
                  disabled={isExtracting}
                />
              </div>

              {/* Premium Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={usePremium}
                    onChange={(e) => setUsePremium(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    disabled={!isPro}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Premium-Extraktion</span>
                      {!isPro && <Badge variant="secondary">Pro</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bessere Qualität • JavaScript-Support • Screenshots
                    </p>
                  </div>
                </label>
                {isPro && usageRemaining !== undefined && (
                  <Badge variant="outline" className="ml-2">
                    {usageRemaining}/20
                  </Badge>
                )}
              </div>

              {/* Main CTA Button */}
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold group"
                onClick={handleExtract}
                disabled={!url.trim() || isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Content wird extrahiert...
                  </>
                ) : (
                  <>
                    Content importieren
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Popular Sources */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Beliebte Quellen:</p>
              <div className="grid grid-cols-2 gap-2">
                {popularSources.map((source) => (
                  <button
                    key={source.name}
                    onClick={() => setUrl(`https://${source.example}`)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                  >
                    <span>{source.icon}</span>
                    <span>{source.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-6">
            <div className="space-y-3">
              <textarea
                placeholder="Füge deinen Newsletter, Blog-Artikel oder anderen Content hier ein..."
                value={value}
                onChange={(e) => onTextInput(e.target.value)}
                className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {value.length} Zeichen
                </span>
                {value.length > 100 && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Bereit zur Generierung
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Text */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Tipp:</strong> Die KI analysiert deinen Content und erstellt automatisch
            optimierte Posts für LinkedIn, X und Instagram. Jeder Post wird auf die jeweilige
            Plattform zugeschnitten.
          </p>
        </div>
      </div>
    </Card>
  );
}

export const EnhancedUrlExtractor = memo(EnhancedUrlExtractorComponent);