import { useEffect, useState } from "react";
import { linkedInPostsFromNewsletter, xTweetsFromBlog, instagramPostsFromBlog } from "@/api/claude";
import { savePost } from "@/api/supabase";
import { SavedPosts } from "@/components/common/SavedPosts";
import {
  createLinkedInDraftPost,
  createLinkedInShareUrl,
  LinkedInAPIError,
} from "@/api/linkedin";
import { Button } from "@/components/ui/button";
import { Button as DSButton } from "@/design-system/components/Button";
import {
  SaveButton,
  EditButton,
  LinkedInShareButton,
  XShareButton,
  InstagramShareButton,
} from "@/design-system/components/ActionButtons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from "@/components/common/Auth";
import { getSession, onAuthStateChange, signOut } from "@/api/supabase";
import { Link } from "react-router-dom";
import { PlatformSelector } from "@/components/common/PlatformSelector";
import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL } from "@/config/platforms";
import { InstagramLogo } from "@/design-system/components/Icons/InstagramLogo";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { PaywallModal } from "@/components/common/PaywallModal";
import { extractFromUrl } from "@/api/extract";

export default function Generator() {
  const [inputText, setInputText] = useState("");
  const [postsByPlatform, setPostsByPlatform] = useState<Record<Platform, string[]>>({
    linkedin: [],
    x: [],
    instagram: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<{ platform: Platform; index: number } | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["linkedin"]);
  const [showPaywall, setShowPaywall] = useState(false);
  const { canTransform, incrementUsage, getRemainingCount, isPro } = useUsageTracking();
  // Track sidebar collapsed state to adjust content padding
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [usePremiumExtraction, setUsePremiumExtraction] = useState(false);
  const [extractionUsage, setExtractionUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

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

  const handleRemix = async () => {
    // Check usage limit
    if (!canTransform()) {
      setShowPaywall(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const baseLinkedInPosts = await linkedInPostsFromNewsletter(inputText);
      const next: Record<Platform, string[]> = { linkedin: [], x: [], instagram: [] };
      if (selectedPlatforms.includes("linkedin")) next.linkedin = baseLinkedInPosts;
      if (selectedPlatforms.includes("x")) {
        // Nutze den exakten X-Prompt über Claude
        next.x = await xTweetsFromBlog(inputText);
      }
      if (selectedPlatforms.includes("instagram")) {
        // Nutze den speziellen Instagram-Prompt
        next.instagram = await instagramPostsFromBlog(inputText);
      }
      setPostsByPlatform(next);
      const names = selectedPlatforms.join(", ");
      toast({ title: "Beiträge erstellt!", description: `Generiert für: ${names}` });
      
      // Increment usage after successful transformation
      incrementUsage();
    } catch (error) {
      console.error("Remix error:", error);
      toast({
        title: "Fehler beim Erstellen",
        description: "LinkedIn-Beiträge konnten nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!sourceUrl) return;
    
    // Check if trying to use premium without Pro
    if (usePremiumExtraction && !isPro) {
      setShowPaywall(true);
      return;
    }
    
    setIsExtracting(true);
    try {
      let result;
      
      if (usePremiumExtraction && isPro) {
        // Premium extraction with Firecrawl
        const { data: session } = await getSession();
        if (!session) throw new Error("Keine aktive Session");
        
        const response = await fetch("/api/extract-premium", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({ url: sourceUrl }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (data.usage) {
            setExtractionUsage(data.usage);
          }
          throw new Error(data.error || "Premium-Extraktion fehlgeschlagen");
        }
        
        result = {
          title: data.title,
          content: data.markdown || data.content || "",
        };
        
        // Update usage information
        if (data.usage) {
          setExtractionUsage(data.usage);
          toast({ 
            title: "Premium-Import erfolgreich ✨", 
            description: `${data.usage.remaining} von ${data.usage.limit} Premium-Extraktionen übrig diesen Monat`
          });
        } else {
          toast({ 
            title: "Premium-Import erfolgreich ✨", 
            description: data.title || "Inhalt wurde mit verbesserter Qualität importiert"
          });
        }
      } else {
        // Standard extraction with Jina
        result = await extractFromUrl(sourceUrl);
        toast({ title: "Inhalt importiert", description: result.title || sourceUrl });
      }
      
      const prefill = [result.title, result.content]
        .filter(Boolean)
        .join("\n\n");
      setInputText(prefill);
    } catch (e) {
      console.error("Extract error", e);
      toast({
        title: "Import fehlgeschlagen",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSavePost = async (content: string, platform: 'linkedin' | 'x' | 'instagram' = 'linkedin') => {
    if (!userEmail) {
      setLoginOpen(true);
      toast({
        title: "Login erforderlich",
        description: "Bitte logge dich ein, um Beiträge zu speichern.",
      });
      return;
    }
    try {
      await savePost(content, platform);
      setRefreshKey((prev) => prev + 1);
      toast({
  title: "Erfolgreich gespeichert",
  description: "Du findest den Beitrag in der Seitenleiste \"Gespeicherte Beiträge\".",
      });
    } catch (error) {
      console.error("Save post error:", error);
      toast({
        title: "Speichern fehlgeschlagen",
        description: `Fehler beim Speichern: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (platform: Platform, index: number, content: string) => {
    setEditing({ platform, index });
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditedContent("");
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const { platform, index } = editing;
    const updated = { ...postsByPlatform };
    updated[platform] = [...updated[platform]];
    updated[platform][index] = editedContent;
    setPostsByPlatform(updated);
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
              Social Transformer
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile Settings button */}
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
      
  <div className="p-4 md:p-8 pt-6 md:pt-8">
  <div className={`max-w-4xl mx-auto space-y-8 ${isSidebarCollapsed ? 'md:pr-[3rem]' : 'md:pr-[22rem]'}`}>
          <div className="text-center space-y-4 pt-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Vom Newsletter zu viralen Posts
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Mehr Sichtbarkeit aus vorhandenem Content
          </p>
          <Badge variant="secondary" className="text-xs md:text-sm">
            Powered by Claude AI ✨
          </Badge>
        </div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Newsletter eingeben oder importieren</CardTitle>
            <CardDescription>
              Füge deinen Newsletter-Text ein oder importiere ihn per URL, und wähle die Zielplattformen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2 flex-col md:flex-row">
                <input
                  type="url"
                  placeholder="https://example.com/dein-blogpost"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border bg-background"
                  aria-label="Quelle-URL"
                />
                <Button onClick={handleExtract} disabled={!sourceUrl || isExtracting} className="md:w-48">
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importiere…
                    </>
                  ) : (
                    <>Von URL importieren</>
                  )}
                </Button>
              </div>
              
              {/* Premium extraction toggle - visible to all, but gated for free users */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePremiumExtraction}
                    onChange={(e) => {
                      if (!isPro && e.target.checked) {
                        setShowPaywall(true);
                        return;
                      }
                      setUsePremiumExtraction(e.target.checked);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground">
                    Premium-Extraktion
                    {!isPro ? (
                      <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>
                    ) : extractionUsage && (
                      <span className="ml-2 text-xs">
                        ({extractionUsage.remaining}/20 übrig)
                      </span>
                    )}
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">
                  Bessere Qualität • JavaScript-Support
                </span>
              </div>
            </div>
            <Textarea
              placeholder="Newsletter hier einfügen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[12rem] text-base resize-none"
            />
            <div className="space-y-2">
              <PlatformSelector value={selectedPlatforms} onChange={setSelectedPlatforms} />
              {!isPro && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="px-3 py-1">
                    {getRemainingCount() > 0 
                      ? `${getRemainingCount()} kostenlose Transformationen heute` 
                      : "Keine kostenlosen Transformationen mehr"}
                  </Badge>
                </div>
              )}
            </div>

            <Button
              onClick={handleRemix}
              disabled={isLoading || !inputText || selectedPlatforms.length === 0}
              size="lg"
              className="w-full text-lg h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Beiträge werden erstellt...
                </>
              ) : (
                <>✨ Transformieren</>
              )}
            </Button>
          </CardContent>
        </Card>
        
  {/* Extra spacing for mobile to prevent content being covered by bottom drawer + safe area */}
  <div className="md:hidden" style={{ height: 'calc(4rem + env(safe-area-inset-bottom))' }} aria-hidden="true" />
        {(["linkedin", "x", "instagram"] as Platform[]).map((platform) => {
          const items = postsByPlatform[platform] || [];
          if (items.length === 0) return null;
          return (
            <Card key={platform} className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{PLATFORM_LABEL[platform]} – {items.length} Beiträge</CardTitle>
                <CardDescription>Plattformspezifische Vorschau und Bearbeitung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {items.map((post, index) => (
                    <Card key={index} className="border-muted/50 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                      <CardContent className="p-6">
                        {editing?.platform === platform && editing?.index === index ? (
                          <div className="space-y-4">
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="min-h-[8rem]"
                            />
                            <div className="flex justify-end gap-2">
                              <DSButton variant="ghost" size="sm" onClick={handleCancelEdit}>
                                Abbrechen
                              </DSButton>
                              <SaveButton size="sm" onClick={handleSaveEdit} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">{post}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-muted/30">
                              <Badge variant="outline" className="text-xs flex items-center gap-1.5">
                                {platform === "instagram" && <InstagramLogo size={12} />}
                                {PLATFORM_LABEL[platform]} · Post #{index + 1}
                              </Badge>
                              <div className="flex gap-2">
                                <EditButton
                                  size="sm"
                                  onClick={() => handleStartEdit(platform, index, post)}
                                  text=""
                                  title="Beitrag bearbeiten"
                                />
                                <SaveButton size="sm" onClick={() => handleSavePost(post, platform)} text="" title="Beitrag speichern" />
                                {platform === "linkedin" && (
                                  <LinkedInShareButton
                                    size="sm"
                                    text=""
                                    onClick={async () => {
                                      try {
                                        const accessToken = import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN;
                                        const authorUrn = import.meta.env.VITE_LINKEDIN_AUTHOR_URN;
                                        if (accessToken && authorUrn) {
                                          const result = await createLinkedInDraftPost(post, { accessToken, authorUrn });
                                          window.open(result.draftUrl, "_blank");
                                          toast({ title: "LinkedIn Draft erstellt! 🚀", description: "Der Draft wurde erfolgreich erstellt." });
                                        } else {
                                          const linkedinUrl = createLinkedInShareUrl(post);
                                          window.open(linkedinUrl, "_blank");
                                        }
                                      } catch (error) {
                                        console.error("LinkedIn Draft Error:", error);
                                        if (error instanceof LinkedInAPIError) {
                                          toast({ title: "LinkedIn API Fehler", description: error.message, variant: "destructive" });
                                        } else {
                                          const linkedinUrl = createLinkedInShareUrl(post);
                                          window.open(linkedinUrl, "_blank");
                                        }
                                      }
                                    }}
                                    title="Auf LinkedIn teilen"
                                  />
                                )}
                                {platform === "x" && (
                                  <XShareButton
                                    size="sm"
                                    text=""
                                    tweetContent={post}
                                    title="Auf X teilen"
                                  />
                                )}
                                {platform === "instagram" && (
                                  <InstagramShareButton
                                    size="sm"
                                    text=""
                                    postContent={post}
                                    title="Auf Instagram teilen"
                                  />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
      
      <SavedPosts
        onCollapse={setIsSidebarCollapsed}
        refreshKey={refreshKey}
        isAuthenticated={!!userEmail}
        onLoginClick={() => setLoginOpen(true)}
      />
      
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
      />
    </div>
  );
}
