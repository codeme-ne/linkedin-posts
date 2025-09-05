<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useEffect, useState } from "react";
import { linkedInPostsFromNewsletter, xTweetsFromBlog, instagramPostsFromBlog, suggestTopicIdeasFromInputs } from "@/api/claude";
>>>>>>> 2d74d0a (feat: Finalize app for launch)
import { savePost } from "@/api/supabase";
import { SavedPosts } from "@/components/common/SavedPosts";
import { AccountButton } from "@/components/common/AccountButton";
import {
  createLinkedInDraftPost,
  createLinkedInShareUrl,
  LinkedInAPIError,
} from "@/api/linkedin";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
<<<<<<< HEAD
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
=======
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
>>>>>>> 2d74d0a (feat: Finalize app for launch)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from "@/components/common/Auth";
// Link import removed - AccountButton now handles navigation
import { PlatformSelector } from "@/components/common/PlatformSelector";
import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL } from "@/config/platforms";
import { InstagramLogo } from "@/design-system/components/Icons/InstagramLogo";
import { PaywallGuard } from "@/components/common/PaywallGuard";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlExtraction } from "@/hooks/useUrlExtraction";
import { usePostEditing } from "@/hooks/usePostEditing";

export default function Generator() {
  // Local state
  const [inputText, setInputText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["linkedin"]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [usePremiumExtraction, setUsePremiumExtraction] = useState(false);
<<<<<<< HEAD
  
  // ShipFast pattern: localStorage-based free tier tracking
  const [freeGenerations, setFreeGenerations] = useState(() => {
    return parseInt(localStorage.getItem('freeGenerationsCount') || '0', 10);
  });
=======
  const [extractionUsage, setExtractionUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  // Progress tracking states
  const [generationProgress, setGenerationProgress] = useState(0); // 0-100
  const [currentPlatformGenerating, setCurrentPlatformGenerating] = useState<string>("");
  const [totalPlatforms, setTotalPlatforms] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState(0);
  // Idea generation from uploads
  const [ideaNotes, setIdeaNotes] = useState("");
  const [ideaTexts, setIdeaTexts] = useState<string[]>([]);
  const [ideaSuggestions, setIdeaSuggestions] = useState<string[]>([]);
  const [topicCount, setTopicCount] = useState<number>(7);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [ideaLinks, setIdeaLinks] = useState<string[]>([]);
  const [tabsValue, setTabsValue] = useState<"posts" | "ideas">("posts");

  // Dev API base: use VITE_DEV_API_TARGET if set; otherwise, when on localhost, fall back to deployed URL
  const DEV_DEFAULT_TARGET = 'https://linkedin-posts-ashen.vercel.app';
  const envTarget = import.meta.env?.VITE_DEV_API_TARGET as string | undefined;
  const apiBase = envTarget && envTarget.length > 0
    ? envTarget.replace(/\/$/, '')
    : (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname)
        ? DEV_DEFAULT_TARGET
        : '');
>>>>>>> 2d74d0a (feat: Finalize app for launch)

  // Custom hooks
  const { userEmail, loginOpen, setLoginOpen, searchParams } = useAuth();
  const { hasAccess } = useSubscription();
  
  // ShipFast pattern: Simple access control
  const canTransform = () => hasAccess || freeGenerations < FREE_LIMIT;
  const canExtract = () => hasAccess || freeGenerations < FREE_LIMIT;
  const isPro = hasAccess;
  const { postsByPlatform, isLoading, generationProgress, generateContent, updatePost } = useContentGeneration();
  const { isExtracting, extractionUsage, extractContent } = useUrlExtraction();
  const { editing, editedContent, setEditedContent, startEdit, cancelEdit, isEditing } = usePostEditing();

  // ShipFast pattern: Save free generations count to localStorage
  useEffect(() => {
<<<<<<< HEAD
    localStorage.setItem('freeGenerationsCount', freeGenerations.toString());
  }, [freeGenerations]);
=======
    getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (session) setLoginOpen(false);
    });
    
    // Load saved style examples
    const savedStyles = window.localStorage.getItem('styleExamples');
    if (savedStyles) {
      setStyleExamples(savedStyles);
    }
    
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);
>>>>>>> 2d74d0a (feat: Finalize app for launch)

  // Event handlers with free tier limits
  const FREE_LIMIT = 3;
  
  const handleRemix = async () => {
    // ShipFast pattern: Check limit before generation
    if (!hasAccess && freeGenerations >= FREE_LIMIT) {
      toast.error("Dein kostenloses Limit ist erreicht. Upgrade zu Premium für unlimitierte Generierungen.");
      return;
    }

    const success = await generateContent(inputText, selectedPlatforms);
    
    // Increment counter only on successful generation for free users
    if (success && !hasAccess) {
      setFreeGenerations(count => count + 1);
    }
  };

  const handleExtract = async () => {
    if (!sourceUrl) return;
    
    // ShipFast pattern: Check limit before extraction
    if (!hasAccess && freeGenerations >= FREE_LIMIT) {
      toast.error("Dein kostenloses Limit ist erreicht. Upgrade zu Premium für unlimitierte Extraktionen.");
      return;
    }
    
    const result = await extractContent(sourceUrl, usePremiumExtraction, isPro);
    if (result) {
      const prefill = [result.title, result.content]
        .filter(Boolean)
        .join("\n\n");
      setInputText(prefill);
      
      // Increment counter only on successful extraction for free users
      if (!hasAccess) {
        setFreeGenerations(count => count + 1);
      }
    }
  };

  const handleSavePost = async (content: string, platform: 'linkedin' | 'x' | 'instagram' = 'linkedin') => {
    if (!userEmail) {
      setLoginOpen(true);
      toast.error("Login erforderlich - Bitte logge dich ein, um Beiträge zu speichern.");
      return;
    }
    try {
      await savePost(content, platform);
      setRefreshKey((prev) => prev + 1);
      toast.success("Erfolgreich gespeichert - Du findest den Beitrag in der Seitenleiste \"Gespeicherte Beiträge\".");
    } catch (error) {
      toast.error(`Speichern fehlgeschlagen - Fehler beim Speichern: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const { platform, index } = editing;
    updatePost(platform, index, editedContent);
    cancelEdit();
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
            {userEmail ? (
              <AccountButton />
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

        <Tabs value={tabsValue} onValueChange={(v) => setTabsValue(v as 'posts' | 'ideas' | 'workflow')} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="posts">Posts erstellen</TabsTrigger>
            <TabsTrigger value="ideas">Themen‑Ideen</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
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
{((!usePremiumExtraction && canExtract()) || (usePremiumExtraction && isPro)) ? (
                  <Button onClick={handleExtract} disabled={!sourceUrl || isExtracting || (!hasAccess && freeGenerations >= FREE_LIMIT)} className="md:w-48">
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importiere…
                      </>
                    ) : (
                      <>Von URL importieren</>
                    )}
                  </Button>
                ) : (
                  <PaywallGuard feature={usePremiumExtraction ? "Premium URL-Extraktion" : "Standard URL-Extraktion"}>
                    <Button disabled className="md:w-48 opacity-50">
                      Von URL importieren (Pro Feature)
                    </Button>
                  </PaywallGuard>
                )}
              </div>
              
              {/* Premium extraction toggle - visible to all, but gated for free users */}
              <div className="flex items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer" title="Bessere Qualität • JavaScript-Support">
                  <input
                    type="checkbox"
                    checked={usePremiumExtraction}
                    onChange={(e) => {
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
              </div>
            </div>
            <Textarea
              placeholder="Newsletter hier einfügen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[10rem] md:min-h-[12rem] text-base resize-none"
            />
            <div className="space-y-2">
              <PlatformSelector value={selectedPlatforms} onChange={setSelectedPlatforms} />
            </div>

            {/* Progress bar - only visible when generating */}
            {isLoading && (
              <div className="space-y-2">
                <Progress value={generationProgress.progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {generationProgress.currentPlatform && `Erstelle ${generationProgress.currentPlatform}-Posts...`}
                  </span>
                  <span>
                    {generationProgress.completedPlatforms}/{generationProgress.totalPlatforms} Plattformen
                  </span>
                </div>
              </div>
            )}

{canTransform() ? (
              <Button
                onClick={handleRemix}
                disabled={isLoading || !inputText || selectedPlatforms.length === 0}
                size="lg"
                className="w-full text-lg h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {generationProgress.progress > 0 
                      ? `${Math.round(generationProgress.progress)}% - ${generationProgress.currentPlatform}`
                      : "Initialisiere..."}
                  </>
                ) : (
                  <>✨ Transformieren</>
                )}
              </Button>
            ) : (
              <PaywallGuard feature="Content-Generierung">
                <Button
                  disabled
                  size="lg"
                  className="w-full text-lg h-12 opacity-50"
                >
                  ✨ Transformieren (Pro Feature)
                </Button>
              </PaywallGuard>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="ideas">
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Themen-Ideen aus Uploads (Beta)</CardTitle>
                <CardDescription>
                  Lade Bild/Text-Dokumente hoch (bis 20MB/Datei) oder füge unten Notizen ein. Wir schlagen dir prägnante Themen-Ideen vor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="idea-files"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,text/plain,text/markdown,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      const addedTexts: string[] = [];
                      let usedApi = 0;
                  for (const f of files) {
                    if (f.size > 20 * 1024 * 1024) {
                          toast({ title: "Datei zu groß", description: `${f.name} überschreitet 20MB`, variant: "destructive" });
                          continue;
                        }
                        const type = (f.type || '').toLowerCase();
                        try {
                          const isText = type.startsWith('text/') || /\.(txt|md)$/i.test(f.name);
                          const needsApi = type.startsWith('image/') || type.startsWith('audio/') || type === 'application/pdf' || /\.(pdf|docx)$/i.test(f.name);
                          if (isText && !needsApi) {
                            const t = (await f.text()).trim();
                            if (t) addedTexts.push(t);
                          } else {
                        const form = new FormData();
                        form.append('file', f, f.name);
                        const url = apiBase ? `${apiBase}/api/extract-file` : '/api/extract-file';
                        const resp = await fetch(url, { method: 'POST', body: form, redirect: 'follow' as RequestRedirect });
                        if (!resp.ok) {
                          let msg = '';
                          try {
                            const j = await resp.json();
                            msg = j?.error || '';
                          } catch { /* noop */ }
                          if (!msg) {
                            try { msg = await resp.text(); } catch { /* noop */ }
                          }
                          throw new Error(msg || `${resp.status} ${resp.statusText}`);
                        }
                        const data = await resp.json();
                        if (data?.text) {
                          addedTexts.push(String(data.text));
                          usedApi++;
                        }
                        if (data?.meta?.links?.length) {
                          setIdeaLinks((prev) => {
                            const set = new Set(prev);
                            for (const l of data.meta.links as string[]) set.add(l);
                            return Array.from(set).slice(0, 200);
                          });
                        }
                      }
                    } catch (err) {
                      console.error('upload extract error', err);
                      const msg = err instanceof Error && err.message ? `: ${err.message.slice(0, 180)}` : '';
                      toast({ title: "Extraktion fehlgeschlagen", description: `${f.name}${msg}` , variant: "destructive" });
                    }
                  }
                  if (addedTexts.length) setIdeaTexts(prev => [...prev, ...addedTexts]);
                  if (!addedTexts.length) return;
                  toast({ title: "Uploads verarbeitet", description: `${addedTexts.length} Textquelle(n) ${usedApi ? `(via API: ${usedApi})` : ''}` });
                  e.currentTarget.value = '';
                }}
              />
              <p className="text-xs text-muted-foreground">Unterstützt: PNG/JPG/WEBP, PDF/DOCX, TXT/MD, Audio (mp3/wav/aac/ogg). Max 20MB/Datei.</p>
            </div>
            {/* Links aus Uploads / Studien */}
            {!!ideaLinks.length && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Gefundene Links / Studien</div>
                <div className="max-h-48 overflow-auto rounded-md border divide-y">
                  {ideaLinks.slice(0, 50).map((link, i) => (
                    <div key={i} className="p-2 text-xs flex items-center gap-2">
                      <span className="truncate flex-1" title={link}>{link}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSourceUrl(link);
                          setTabsValue("posts");
                        }}
                      >
                        Übernehmen
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Manuelles Einfügen von Links */}
            <div className="space-y-2">
              <Textarea
                placeholder="Optional: Mehrere Links (je Zeile eine URL) einfügen…"
                className="min-h-[6rem]"
                onBlur={(e) => {
                  const lines = e.target.value.split(/\n+/).map(s => s.trim()).filter(Boolean);
                  if (!lines.length) return;
                  setIdeaLinks(prev => Array.from(new Set([...prev, ...lines])));
                  e.target.value = '';
                  toast({ title: "Links hinzugefügt", description: `${lines.length} Link(s) gespeichert.` });
                }}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Kurz einfügen: Worüber willst du posten? Was gefällt dir am Stil? (optional)"
                value={ideaNotes}
                onChange={(e) => setIdeaNotes(e.target.value)}
                className="min-h-[8rem]"
              />
            </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {!!ideaTexts.length && <span>{ideaTexts.length} Text-Quelle(n)</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={isSuggesting || (!ideaNotes && ideaTexts.length === 0)}
                    onClick={async () => {
                      setIsSuggesting(true);
                      try {
                    const ideas = await suggestTopicIdeasFromInputs({ userNotes: ideaNotes, texts: ideaTexts });
                        setIdeaSuggestions(ideas);
                        if (!ideas.length) {
                          toast({ title: "Keine Ideen", description: "Bitte mehr Kontext/Text hinzufügen." });
                        }
                      } catch (e) {
                        console.error(e);
                        toast({ title: "Fehler", description: "Ideen konnten nicht generiert werden.", variant: "destructive" });
                      } finally {
                        setIsSuggesting(false);
                      }
                    }}
                    className="md:w-56"
                  >
                    {isSuggesting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysiere…</>) : (<>Themen-Ideen generieren</>)}
                  </Button>
                  {!!ideaSuggestions.length && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const joined = ideaSuggestions.slice(0, 3).map((s, i) => `${i+1}. ${s}`).join("\n");
                        setInputText(prev => [joined, prev].filter(Boolean).join("\n\n"));
                        toast({ title: "Übernommen", description: "Top-Ideen zum Eingabetext hinzugefügt." });
                      }}
                    >
                      Top‑Ideen übernehmen
                    </Button>
                  )}
                </div>
                {!!ideaSuggestions.length && (
                  <div className="bg-muted/40 rounded-md p-3 text-sm whitespace-pre-wrap">
                    {ideaSuggestions.map((s) => `• ${s}`).join("\n")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
                      <label className="text-sm font-medium">Oder URL eingeben</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://..."
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                        />
                        <Button
                          onClick={async () => {
                            if (!sourceUrl.trim()) return;
                            setIsExtracting(true);
                            try {
                              const result = await extractFromUrl(sourceUrl);
                              const content = [result.title, result.content].filter(Boolean).join("\n\n");
                              setInputText(content);
                              toast({ title: "Inhalt importiert", description: result.title || sourceUrl });
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
                          }}
                          disabled={isExtracting || !sourceUrl.trim()}
                        >
                          {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extrahieren"}
                        </Button>
                      </div>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hochgeladene Dateien ({uploadedFiles.length})</label>
                        <div className="max-h-48 overflow-auto rounded-md border divide-y">
                          {uploadedFiles.map((file, i) => (
                            <div key={i} className="p-2 flex items-center justify-between hover:bg-muted/50">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[0] || 'text'}
                                  {file.text && ` • ${file.text.slice(0, 50)}...`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadedFiles(prev => prev.filter((_, idx) => idx !== i));
                                  setIdeaTexts(prev => {
                                    const newTexts = [...prev];
                                    newTexts.splice(i, 1);
                                    return newTexts;
                                  });
                                  toast({ title: "Datei entfernt", description: file.name });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ideaTexts.length} Textquelle(n) bereit für Themenextraktion
                        </p>
                      </div>
                    )}
                  </div>
                ),
                topics: (
                  <div className="space-y-4">
                    {/* Context info */}
                    {(ideaTexts.length > 0 || uploadedFiles.length > 0) && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-1">Verfügbare Quellen</p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedFiles.length} Datei(en) hochgeladen • {ideaTexts.length} Textquelle(n) extrahiert
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Zusätzlicher Kontext</label>
                      <Textarea
                        placeholder="Beschreibe deine Zielgruppe, gewünschte Themen oder spezielle Anforderungen..."
                        value={ideaNotes}
                        onChange={(e) => setIdeaNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Anzahl Themen</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            min="3"
                            max="15"
                            value={topicCount}
                            onChange={(e) => setTopicCount(Math.min(15, Math.max(3, parseInt(e.target.value) || 7)))}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">Ideen generieren</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={async () => {
                        if (!ideaNotes && ideaTexts.length === 0) {
                          toast({ 
                            title: "Keine Quellen verfügbar", 
                            description: "Bitte lade erst Dateien hoch oder füge Notizen hinzu.",
                            variant: "destructive" 
                          });
                          return;
                        }
                        
                        setIsSuggesting(true);
                        try {
                          const ideas = await suggestTopicIdeasFromInputs({ 
                            userNotes: ideaNotes, 
                            texts: ideaTexts 
                          });
                          setIdeaSuggestions(ideas.slice(0, topicCount));
                          if (!ideas.length) {
                            toast({ 
                              title: "Keine Ideen generiert", 
                              description: "Bitte mehr Kontext oder andere Dateien hinzufügen." 
                            });
                          } else {
                            toast({ 
                              title: "Themen erfolgreich generiert", 
                              description: `${ideas.length} Themen-Ideen erstellt` 
                            });
                          }
                        } catch (e) {
                          console.error('Topic generation error:', e);
                          const errorMsg = e instanceof Error ? e.message : 'Unbekannter Fehler';
                          toast({ 
                            title: "Fehler bei der Themengenerierung", 
                            description: errorMsg.slice(0, 100), 
                            variant: "destructive" 
                          });
                        } finally {
                          setIsSuggesting(false);
                        }
                      }}
                      disabled={isSuggesting || (!ideaNotes && ideaTexts.length === 0)}
                      className="w-full"
                    >
                      {isSuggesting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysiere...</>
                      ) : (
                        <>Themen-Ideen generieren</>
                      )}
                    </Button>
                    
                    {ideaSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Generierte Themen ({ideaSuggestions.length})</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsSuggesting(true);
                              // Regenerate with same parameters
                              suggestTopicIdeasFromInputs({ 
                                userNotes: ideaNotes, 
                                texts: ideaTexts 
                              }).then(ideas => {
                                setIdeaSuggestions(ideas.slice(0, topicCount));
                                toast({ title: "Neue Themen generiert" });
                              }).finally(() => setIsSuggesting(false));
                            }}
                            disabled={isSuggesting}
                          >
                            Neu generieren
                          </Button>
                        </div>
                        <div className="bg-muted/40 rounded-md p-3 text-sm space-y-2">
                          {ideaSuggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 group hover:bg-background/50 p-1 rounded">
                              <span className="text-muted-foreground">{i + 1}.</span>
                              <span className="flex-1">{s}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                                onClick={() => {
                                  setInputText(prev => prev ? `${prev}\n\n${i+1}. ${s}` : `${i+1}. ${s}`);
                                  toast({ title: "Thema hinzugefügt", description: `"${s.slice(0, 50)}..."` });
                                }}
                              >
                                +
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const joined = ideaSuggestions.slice(0, 3).map((s, i) => `${i+1}. ${s}`).join("\n");
                              setInputText(prev => [joined, prev].filter(Boolean).join("\n\n"));
                              toast({ title: "Übernommen", description: "Top-3 Themen zum Eingabetext hinzugefügt." });
                            }}
                          >
                            Top-3 übernehmen
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const allJoined = ideaSuggestions.map((s, i) => `${i+1}. ${s}`).join("\n");
                              setInputText(allJoined);
                              toast({ title: "Alle übernommen", description: `${ideaSuggestions.length} Themen als Eingabetext gesetzt.` });
                            }}
                          >
                            Alle verwenden
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ),
                style: (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Schreibstil wählen</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'professional', label: '📚 Professionell', desc: 'Sachlich und strukturiert' },
                          { id: 'casual', label: '💬 Casual', desc: 'Locker und persönlich' },
                          { id: 'storytelling', label: '📖 Storytelling', desc: 'Erzählerisch und emotional' },
                          { id: 'direct', label: '🎯 Direkt', desc: 'Klar und auf den Punkt' }
                        ].map((style) => (
                          <Button
                            key={style.id}
                            variant={selectedStyle === style.id ? "default" : "outline"}
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => setSelectedStyle(style.id)}
                          >
                            <div className="text-left">
                              <div>{style.label}</div>
                              <div className="text-xs text-muted-foreground font-normal">{style.desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Eigene Stil-Beispiele</label>
                      <Textarea
                        placeholder="Füge hier Beispiel-Posts ein, die deinem gewünschten Stil entsprechen..."
                        className="min-h-[150px]"
                        value={styleExamples}
                        onChange={(e) => {
                          setStyleExamples(e.target.value);
                          window.localStorage.setItem('styleExamples', e.target.value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Diese Beispiele werden als Stil-Referenz für die KI verwendet
                      </p>
                    </div>
                    
                    {styleExamples && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-xs font-medium mb-1">Stil-Referenz gespeichert</p>
                        <p className="text-xs text-muted-foreground">
                          {styleExamples.split('\n').length} Zeile(n) • {styleExamples.length} Zeichen
                        </p>
                      </div>
                    )}
                  </div>
                ),
                generate: (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Eingabetext</label>
                      <Textarea
                        placeholder="Newsletter, Blogpost oder eigener Text..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[150px] md:min-h-[200px] text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Plattformen</label>
                      <PlatformSelector
                        value={selectedPlatforms}
                        onChange={setSelectedPlatforms}
                      />
                    </div>
                    
                    <Button
                      onClick={handleRemix}
                      disabled={isLoading || !inputText.trim() || selectedPlatforms.length === 0}
                      className="w-full"
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generiere...</>
                      ) : (
                        <>Posts generieren</>
                      )}
                    </Button>
                    
                    {generationProgress > 0 && generationProgress < 100 && (
                      <div className="space-y-2">
                        <Progress value={generationProgress} />
                        <p className="text-xs text-center text-muted-foreground">
                          {currentPlatformGenerating && `Generiere ${currentPlatformGenerating}...`}
                        </p>
                      </div>
                    )}
                  </div>
                ),
                review: (
                  <div className="space-y-4">
                    {Object.entries(postsByPlatform).map(([platform, posts]) => 
                      posts.length > 0 && (
                        <Card key={platform}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {PLATFORM_LABEL[platform as Platform]} Posts
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {posts.map((post, index) => (
                              <div key={index} className="p-3 bg-muted rounded-md">
                                <pre className="whitespace-pre-wrap text-sm">{post}</pre>
                                <div className="flex gap-2 mt-2">
                                  <SaveButton
                                    onClick={async () => {
                                      if (!userEmail) {
                                        setLoginOpen(true);
                                        return;
                                      }
                                      try {
                                        await savePost(post, platform as Platform);
                                        toast({ title: "Gespeichert" });
                                        setRefreshKey(Date.now());
                                      } catch (error) {
                                        console.error(error);
                                        toast({ title: "Fehler beim Speichern", variant: "destructive" });
                                      }
                                    }}
                                  />
                                  {platform === "linkedin" && <LinkedInShareButton text={post} />}
                                  {platform === "x" && <XShareButton text={post} />}
                                  {platform === "instagram" && <InstagramShareButton />}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )
                    )}
                    
                    {Object.values(postsByPlatform).every(posts => posts.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        Noch keine Posts generiert. Gehe zurück zum "Posts generieren" Schritt.
                      </div>
                    )}
                  </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-8">
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
                        {isEditing(platform, index) ? (
                          <div className="space-y-4">
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="min-h-[8rem]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                Abbrechen
                              </Button>
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
                                  onClick={() => startEdit(platform, index, post)}
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
                                          toast.success("LinkedIn Draft erstellt! 🚀 - Der Draft wurde erfolgreich erstellt.");
                                        } else {
                                          const linkedinUrl = createLinkedInShareUrl(post);
                                          window.open(linkedinUrl, "_blank");
                                        }
                                      } catch (error) {
                                        if (error instanceof LinkedInAPIError) {
                                          toast.error(`LinkedIn API Fehler - ${error.message}`);
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
      </div>
      
      <SavedPosts
        onCollapse={setIsSidebarCollapsed}
        refreshKey={refreshKey}
        isAuthenticated={!!userEmail}
        onLoginClick={() => setLoginOpen(true)}
        initialExpanded={searchParams.get('expand') === 'saved'}
      />
    </div>
  );
}