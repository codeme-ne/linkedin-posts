import { useEffect, useState } from "react";
import { linkedInPostsFromNewsletter, xTweetsFromBlog, instagramPostsFromBlog } from "@/api/claude";
import { savePost } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Button as DSButton } from "@/design-system/components/Button";
import {
  SaveButton,
  EditButton,
  LinkedInShareButton,
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from "@/components/common/Auth";
import { getSession, onAuthStateChange, signOut } from "@/api/supabase";
import { Link, useSearchParams } from "react-router-dom";
import { PlatformSelector } from "@/components/common/PlatformSelector";
import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL } from "@/config/platforms";
import { InstagramLogo } from "@/design-system/components/Icons/InstagramLogo";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { PaywallModal } from "@/components/common/PaywallModal";
import { extractFromUrl } from "@/api/extract";
import { PostSkeleton } from "@/components/common/PostSkeleton";

export default function Generator() {
  const [inputText, setInputText] = useState("");
  const [posts, setPosts] = useState<Array<{ platform: Platform; content: string; description?: string; title?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlatformGenerating, setCurrentPlatformGenerating] = useState<Platform | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { getRemainingCount } = useUsageTracking();
  const [searchParams] = useSearchParams();
  
  // URL extraction state
  const [sourceUrl, setSourceUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExtract = async () => {
    if (!sourceUrl) return;
    
    setIsExtracting(true);
    try {
      const extractedContent = await extractFromUrl(sourceUrl);
      setInputText(extractedContent.content || extractedContent.toString());
      toast({
        title: "Inhalt extrahiert",
        description: "Der Inhalt wurde erfolgreich von der URL extrahiert.",
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Fehler",
        description: "Der Inhalt konnte nicht extrahiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const generatePosts = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Text ein.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens eine Plattform aus.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowAuth(true);
      return;
    }

    const remainingCount = getRemainingCount();
    if (remainingCount <= 0) {
      setShowPaywall(true);
      return;
    }

    setIsLoading(true);
    setPosts([]);
    setGenerationProgress(0);

    const newPosts: Array<{ platform: Platform; content: string; description?: string; title?: string }> = [];
    const totalPlatforms = selectedPlatforms.length;

    for (let i = 0; i < selectedPlatforms.length; i++) {
      const platform = selectedPlatforms[i];
      setCurrentPlatformGenerating(platform);
      setGenerationProgress(((i) / totalPlatforms) * 100);

      try {
        let result;
        if (platform === "linkedin") {
          result = await linkedInPostsFromNewsletter(inputText);
        } else if (platform === "x") {
          result = await xTweetsFromBlog(inputText);
        } else if (platform === "instagram") {
          result = await instagramPostsFromBlog(inputText);
        }

        if (result) {
          if (Array.isArray(result)) {
            result.forEach((post: string) => {
              newPosts.push({ platform, content: post });
            });
          } else if (typeof result === 'object' && 'posts' in result) {
            (result as any).posts.forEach((post: string) => {
              newPosts.push({ platform, content: post });
            });
          } else if (typeof result === 'string') {
            newPosts.push({ platform, content: result });
          }
        }
      } catch (error) {
        console.error(`Error generating ${platform} posts:`, error);
        toast({
          title: "Fehler",
          description: `Fehler beim Erstellen der ${PLATFORM_LABEL[platform]} Posts. Bitte versuchen Sie es erneut.`,
          variant: "destructive",
        });
      }
    }

    setGenerationProgress(100);
    setPosts(newPosts);
    setIsLoading(false);
    setCurrentPlatformGenerating(null);
  };

  const handleSave = async (post: string, platform: Platform) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      await savePost(user.id, post, platform);
      toast({
        title: "Gespeichert",
        description: `Post wurde zu ${PLATFORM_LABEL[platform]} gespeichert.`,
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Fehler",
        description: "Post konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-bold text-slate-800">
              Social Transformer
            </Link>
          </div>
          <Auth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-2xl font-bold text-slate-800">
            Social Transformer
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.email}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Einstellungen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Link to="/settings">
                    <Button variant="outline" className="w-full justify-start">
                      Erweiterte Einstellungen
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    Abmelden
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* URL Extraction Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>URL Inhalt extrahieren (Optional)</CardTitle>
            <CardDescription>
              Geben Sie eine URL ein, um automatisch den Inhalt zu extrahieren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://beispiel.com/artikel"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleExtract}
                disabled={!sourceUrl || isExtracting}
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Extrahieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Newsletter oder Blog Post</CardTitle>
            <CardDescription>
              Fügen Sie hier Ihren Newsletter oder Blog Post ein, um ihn in Social Media Posts zu transformieren.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Fügen Sie hier Ihren Newsletter oder Blog Post ein..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            
            <PlatformSelector
              value={selectedPlatforms}
              onChange={setSelectedPlatforms}
            />

            <DSButton
              variant="primary"
              onClick={generatePosts}
              disabled={isLoading || !inputText.trim() || selectedPlatforms.length === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generiere {currentPlatformGenerating ? PLATFORM_LABEL[currentPlatformGenerating] : ''} Posts...
                </>
              ) : (
                "Posts transformieren"
              )}
            </DSButton>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Fortschritt</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section with Skeleton Loaders */}
        {isLoading && selectedPlatforms.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedPlatforms.map((platform) => (
              <PostSkeleton key={platform} platform={platform} />
            ))}
          </div>
        )}

        {/* Results Section */}
        {!isLoading && posts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Card key={index} className="relative">
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                  <Badge variant="outline" className="flex items-center gap-2">
                    {post.platform === "instagram" && <InstagramLogo className="h-4 w-4" />}
                    {PLATFORM_LABEL[post.platform]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {post.content}
                  </div>
                  <div className="flex gap-2">
                    <SaveButton
                      onClick={() => handleSave(post.content, post.platform)}
                      className="flex-1"
                    />
                    {post.platform === "linkedin" && (
                      <LinkedInShareButton
                        onClick={() => {
                          const shareText = encodeURIComponent(post.content);
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareText}`, '_blank');
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showAuth && (
          <Dialog open={showAuth} onOpenChange={setShowAuth}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anmeldung erforderlich</DialogTitle>
              </DialogHeader>
              <Auth />
            </DialogContent>
          </Dialog>
        )}

        <PaywallModal 
          open={showPaywall} 
          onOpenChange={setShowPaywall}
        />
      </div>
    </div>
  );
}