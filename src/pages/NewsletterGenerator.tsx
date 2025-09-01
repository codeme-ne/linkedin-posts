import { useEffect, useState } from "react";
import { newsletterFromTopic } from "@/api/claude";
import { savePost } from "@/api/supabase";
import { Platform } from "@/config/platforms";
import { Button } from "@/components/ui/button";
import { Button as DSButton } from "@/design-system/components/Button";
import { SaveButton, EditButton } from "@/design-system/components/ActionButtons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Settings as SettingsIcon, 
  Upload,
  Mic,
  Copy,
  RefreshCw 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from "@/components/common/Auth";
import { getSession, onAuthStateChange, signOut } from "@/api/supabase";
import { Link } from "react-router-dom";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { PaywallModal } from "@/components/common/PaywallModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VOICE_TONES = [
  { value: "professional", label: "Professionell" },
  { value: "casual", label: "Locker & Casual" },
  { value: "informative", label: "Informativ" },
  { value: "persuasive", label: "Überzeugend" },
  { value: "friendly", label: "Freundlich" },
  { value: "authoritative", label: "Autoritativ" }
];

const NEWSLETTER_LENGTHS = [
  { value: "short", label: "Kurz (300-500 Wörter)" },
  { value: "medium", label: "Mittel (500-800 Wörter)" },
  { value: "long", label: "Lang (800-1200 Wörter)" }
];

export default function NewsletterGenerator() {
  const [topic, setTopic] = useState("");
  const [generatedNewsletter, setGeneratedNewsletter] = useState<{
    subject: string;
    preview: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<'subject' | 'preview' | 'content' | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { canTransform, incrementUsage } = useUsageTracking();
  const [voiceTone, setVoiceTone] = useState("professional");
  const [newsletterLength, setNewsletterLength] = useState("medium");
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (session) setLoginOpen(false);
    });
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Thema eingeben",
        description: "Bitte gib ein Thema für deinen Newsletter ein.",
        variant: "destructive",
      });
      return;
    }

    if (!canTransform()) {
      setShowPaywall(true);
      return;
    }
    
    setIsLoading(true);
    setGenerationProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const newsletter = await newsletterFromTopic(topic, voiceTone, newsletterLength);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setGeneratedNewsletter(newsletter);
      toast({ 
        title: "Newsletter erstellt!", 
        description: "Dein Newsletter wurde erfolgreich generiert." 
      });
      
      incrementUsage();
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Fehler beim Erstellen",
        description: "Newsletter konnte nicht erstellt werden.",
        variant: "destructive",
      });
      setGenerationProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewsletter = async (content: string) => {
    if (!userEmail) {
      setLoginOpen(true);
      toast({
        title: "Login erforderlich",
        description: "Bitte logge dich ein, um Newsletter zu speichern.",
      });
      return;
    }
    
    try {
      // Save as newsletter type in the existing saved_posts table
      await savePost(content, 'newsletter' as Platform);
      toast({
        title: "Erfolgreich gespeichert",
        description: "Du findest den Newsletter in der Seitenleiste \"Gespeicherte Beiträge\".",
      });
    } catch (error) {
      console.error("Save newsletter error:", error);
      toast({
        title: "Speichern fehlgeschlagen",
        description: `Fehler beim Speichern: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Kopiert!",
        description: "Inhalt wurde in die Zwischenablage kopiert.",
      });
    } catch {
      toast({
        title: "Kopieren fehlgeschlagen",
        description: "Konnte nicht in die Zwischenablage kopieren.",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (type: 'subject' | 'preview' | 'content', content: string) => {
    setEditing(type);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditedContent("");
  };

  const handleSaveEdit = () => {
    if (!editing || !generatedNewsletter) return;
    
    const updated = { ...generatedNewsletter };
    updated[editing] = editedContent;
    setGeneratedNewsletter(updated);
    setEditing(null);
    setEditedContent("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary overflow-x-hidden">
      {/* Professional Header Bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Newsletter Generator
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/app" className="hidden md:block">
              <Button variant="ghost" size="sm">Social Posts</Button>
            </Link>
            <Link to="/settings" className="md:hidden">
              <Button variant="ghost" size="sm" aria-label="Einstellungen">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/settings" className="hidden md:block">
              <Button variant="ghost" size="sm">Einstellungen</Button>
            </Link>
            {userEmail ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">Login</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Einloggen</DialogTitle>
                  </DialogHeader>
                  <Auth />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Newsletter erstellen</CardTitle>
                <CardDescription>
                  Gib ein Thema ein und lass einen professionellen Newsletter generieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic Input Tabs */}
                <Tabs defaultValue="your-topic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="your-topic">Your Topic</TabsTrigger>
                    <TabsTrigger value="suggested">Suggested Topic</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="your-topic" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Newsletter Thema</label>
                      <Textarea
                        placeholder="Gib dein Newsletter-Thema ein (mindestens 5 Wörter)..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="suggested" className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Themen-Vorschläge werden bald verfügbar sein</p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Klicke oder ziehe Dateien hierher (optional)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Unterstützt: PDF, DOC, TXT, Bilder
                    </p>
                  </div>
                </div>

                {/* Voice Tone Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Tone
                  </label>
                  <Select value={voiceTone} onValueChange={setVoiceTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_TONES.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Newsletter Length */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Newsletter-Länge</label>
                  <Select value={newsletterLength} onValueChange={setNewsletterLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWSLETTER_LENGTHS.map((length) => (
                        <SelectItem key={length.value} value={length.value}>
                          {length.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress Bar */}
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Generiere Newsletter...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                  </div>
                )}

                {/* Generate Button */}
                <DSButton
                  onClick={handleGenerate}
                  disabled={isLoading || topic.trim().length < 5}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generiere...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Newsletter generieren
                    </>
                  )}
                </DSButton>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 space-y-6">
            {generatedNewsletter ? (
              <div className="space-y-4">
                {/* Subject Line */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Betreffzeile</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartEdit('subject', generatedNewsletter.subject)}
                        >
                          <EditButton size="sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyToClipboard(generatedNewsletter.subject)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing === 'subject' ? (
                      <div className="space-y-2">
                        <Input
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Speichern</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-medium text-lg">{generatedNewsletter.subject}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Preview Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Vorschautext</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartEdit('preview', generatedNewsletter.preview)}
                        >
                          <EditButton size="sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyToClipboard(generatedNewsletter.preview)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing === 'preview' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Speichern</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{generatedNewsletter.preview}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Main Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Newsletter-Inhalt</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStartEdit('content', generatedNewsletter.content)}
                        >
                          <EditButton size="sm" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyToClipboard(generatedNewsletter.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <SaveButton
                          onClick={() => handleSaveNewsletter(generatedNewsletter.content)}
                          size="sm"
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing === 'content' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[400px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Speichern</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Abbrechen</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {generatedNewsletter.content}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="text-muted-foreground">
                    <h3 className="text-lg font-medium mb-2">Newsletter-Vorschau</h3>
                    <p>Gib ein Thema ein und klicke auf "Newsletter generieren", um zu beginnen.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={() => setShowPaywall(false)} 
      />
    </div>
  );
}