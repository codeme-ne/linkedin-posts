import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

// Core components
import { AccountButton } from "@/components/common/AccountButton";
import { Auth } from "@/components/common/Auth";
import { SavedPosts } from "@/components/common/SavedPosts";
import { CharacterCounterTextarea } from "@/components/common/CharacterCounter";
import { VoiceToneSelector, VoiceToneTrigger } from "@/components/common/VoiceToneSelector";
import {
  GeneratingPosts
} from "@/components/common/SkeletonLoaders";

// UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import {
  SaveButton,
  EditButton,
  LinkedInShareButton,
  XShareButton,
  InstagramShareButton,
} from "@/design-system/components/ActionButtons";

// Icons
import {
  Link as LinkIcon,
  Type,
  Zap,
  Bookmark,
  Sparkles,
  ExternalLink,
  LogIn
} from "lucide-react";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useUrlExtraction } from "@/hooks/useUrlExtraction";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useContentGeneration } from "@/hooks/useContentGeneration";

// Performance monitoring
import { perfMonitor, PERF_MARKS, PERF_MEASURES } from "@/utils/performance";

// Types
import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL } from "@/config/platforms";
import { savePost } from "@/api/supabase";
import { createLinkedInShareUrl } from "@/api/linkedin";
import { DEFAULT_VOICE_TONE, type VoiceTone } from "@/config/voice-tones";

// Mobile components
import { MobileBottomSheet, useMobileBottomSheet } from "@/components/mobile/MobileBottomSheet";

interface GeneratedPost {
  content: string;
  platform: Platform;
  createdAt: Date;
  characterCount: number;
}

type InputMode = 'url' | 'text';

export default function GeneratorV2() {
  // Mark app initialization
  useEffect(() => {
    perfMonitor.mark(PERF_MARKS.APP_INIT);
  }, []);

  // Core state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['linkedin']);
  const [generatedPosts, setGeneratedPosts] = useState<Record<Platform, GeneratedPost[]>>({} as Record<Platform, GeneratedPost[]>);
  const [activeTab, setActiveTab] = useState<Platform>('linkedin');
  const [currentTone, setCurrentTone] = useState<VoiceTone>(DEFAULT_VOICE_TONE);
  const [isToneSelectorOpen, setIsToneSelectorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<{platform: Platform, index: number} | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const bottomSheet = useMobileBottomSheet();

  // Hooks
  const { userEmail, loginOpen, setLoginOpen } = useAuth();
  const { hasAccess } = useSubscription();
  const { isPremium, checkAndIncrementUsage } = useUsageTracking();
  const { extractContent } = useUrlExtraction();
  const { generateContent, isLoading: isGenerating } = useContentGeneration();

  const isPro = hasAccess || isPremium;
  const currentContent = textInput; // Use text input as main content

  // Fix Magic Link auth state synchronization
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authType = urlParams.get('type');

    if (authType === 'magiclink' || authType === 'recovery') {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      toast.success("Erfolgreich eingeloggt!");
    }
  }, []);

  // Auto-switch tab when posts are generated
  useEffect(() => {
    const platforms = Object.keys(generatedPosts).filter(platform =>
      generatedPosts[platform as Platform]?.length > 0
    );
    if (platforms.length > 0 && !platforms.includes(activeTab)) {
      setActiveTab(platforms[0] as Platform);
    }
  }, [generatedPosts, activeTab]);

  // Handle URL extraction
  const handleExtractFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return;

    setIsExtracting(true);
    try {
      const canProceed = await checkAndIncrementUsage();
      if (!canProceed) {
        toast.error('Usage limit reached');
        return;
      }

      perfMonitor.mark(PERF_MARKS.EXTRACTION_START);
      const result = await extractContent(urlInput, false, isPro);

      if (result) {
        const extractedText = [result.title, result.content]
          .filter(Boolean)
          .join("\n\n");
        setTextInput(extractedText);
        setInputMode('text'); // Switch to text mode after extraction

        perfMonitor.mark(PERF_MARKS.EXTRACTION_END);
        perfMonitor.measure(PERF_MEASURES.EXTRACTION_DURATION, PERF_MARKS.EXTRACTION_START, PERF_MARKS.EXTRACTION_END);
        toast.success("Content extracted successfully!");
      }
    } catch (error) {
      toast.error(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  }, [urlInput, checkAndIncrementUsage, extractContent, isPro]);

  // Handle content generation
  const handleGenerate = useCallback(async () => {
    if (!currentContent.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
      toast.error('Usage limit reached');
      return;
    }

    try {
      perfMonitor.mark(PERF_MARKS.GENERATION_START);

      const result = await generateContent(currentContent, selectedPlatforms);

      if (result) {
        selectedPlatforms.forEach(platform => {
          // For now, use the same result for all platforms
          // This may need adjustment based on the actual hook implementation
          const generatedContent = typeof result === 'string' ? result : String(result);

          if (generatedContent) {
            const newPost: GeneratedPost = {
              content: generatedContent,
              platform,
              createdAt: new Date(),
              characterCount: generatedContent.length
            };

            setGeneratedPosts(prev => ({
              ...prev,
              [platform]: [...(prev[platform] || []), newPost]
            }));

            toast.success(`${PLATFORM_LABEL[platform]} post generated!`);
          }
        });
      }

      perfMonitor.mark(PERF_MARKS.GENERATION_END);
      perfMonitor.measure(PERF_MEASURES.GENERATION_DURATION, PERF_MARKS.GENERATION_START, PERF_MARKS.GENERATION_END);
    } catch (error) {
      toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentContent, selectedPlatforms, checkAndIncrementUsage, generateContent]);

  // Handle save post
  const handleSavePost = async (content: string, platform: Platform) => {
    if (!userEmail) {
      setLoginOpen(true);
      toast.error("Login required to save posts");
      return;
    }

    try {
      await savePost(content, platform);
      setRefreshKey(prev => prev + 1);
      toast.success("Post saved successfully!");
    } catch (error) {
      toast.error(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle platform selection
  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Handle editing
  const startEdit = (platform: Platform, index: number, content: string) => {
    setIsEditing({ platform, index });
    setEditingContent(content);
  };

  const saveEdit = () => {
    if (!isEditing) return;

    setGeneratedPosts(prev => {
      const updated = { ...prev };
      updated[isEditing.platform][isEditing.index] = {
        ...updated[isEditing.platform][isEditing.index],
        content: editingContent,
        characterCount: editingContent.length
      };
      return updated;
    });

    setIsEditing(null);
    setEditingContent('');
    toast.success("Post updated!");
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditingContent('');
  };

  // Main render - Clean single-column design
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header - Clean and minimal */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Social Transformer
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {userEmail ? (
                <AccountButton />
              ) : (
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <Auth />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single column, clean layout */}
      <main className={`max-w-4xl mx-auto px-4 py-8 space-y-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pr-16' : 'lg:pr-[23rem]'}`}>

        {/* Input Section - Unified input with smart switching */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Content Input
              </CardTitle>
              <div className="flex items-center space-x-2">
                <VoiceToneTrigger
                  currentTone={currentTone}
                  onClick={() => setIsToneSelectorOpen(true)}
                  size="sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Input Mode Toggle */}
            <div className="flex items-center space-x-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
              <Button
                variant={inputMode === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('text')}
                className="h-8 px-3 text-sm"
              >
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button
                variant={inputMode === 'url' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('url')}
                className="h-8 px-3 text-sm"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                URL
              </Button>
            </div>

            {/* URL Input */}
            {inputMode === 'url' && (
              <div className="space-y-4 mb-6">
                <div className="flex space-x-3">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter URL to extract content from..."
                    className="flex-1"
                    disabled={isExtracting}
                  />
                  <Button
                    onClick={handleExtractFromUrl}
                    disabled={!urlInput.trim() || isExtracting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isExtracting ? (
                      <>Extracting...</>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
                {isPro && (
                  <p className="text-xs text-gray-500">Premium extraction enabled</p>
                )}
              </div>
            )}

            {/* Text Input */}
            <div className="space-y-4">
              <CharacterCounterTextarea
                value={textInput}
                onChange={setTextInput}
                placeholder="Paste your newsletter, blog post, or any content you want to transform into social media posts..."
                rows={8}
                className="min-h-[200px] resize-y"
              />

              {/* Platform Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Generate for platforms:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['linkedin', 'x', 'instagram'] as Platform[]).map(platform => (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePlatformToggle(platform)}
                      className="h-8"
                    >
                      {PLATFORM_LABEL[platform]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!currentContent.trim() || selectedPlatforms.length === 0 || isGenerating}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              >
                {isGenerating ? (
                  <GeneratingPosts platform="linkedin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Posts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section - Clean tabs without nested cards */}
        {Object.keys(generatedPosts).some(platform =>
          generatedPosts[platform as Platform]?.length > 0
        ) && (
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Generated Posts
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Platform)}>
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 p-0">
                  {(Object.keys(generatedPosts) as Platform[]).map(platform => {
                    const posts = generatedPosts[platform] || [];
                    if (posts.length === 0) return null;

                    return (
                      <TabsTrigger
                        key={platform}
                        value={platform}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 h-12 px-6"
                      >
                        {PLATFORM_LABEL[platform]}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {posts.length}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {(Object.keys(generatedPosts) as Platform[]).map(platform => {
                  const posts = generatedPosts[platform] || [];
                  if (posts.length === 0) return null;

                  return (
                    <TabsContent key={platform} value={platform} className="p-6 space-y-4">
                      {posts.map((post, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          {isEditing?.platform === platform && isEditing?.index === index ? (
                            <div className="space-y-4">
                              <CharacterCounterTextarea
                                value={editingContent}
                                onChange={setEditingContent}
                                platform={platform}
                                rows={6}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={cancelEdit}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveEdit}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap text-gray-900 leading-relaxed mb-4">
                                {post.content}
                              </p>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="text-xs">
                                    {PLATFORM_LABEL[platform]}
                                  </Badge>
                                  <span>•</span>
                                  <span>{post.characterCount} chars</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <CopyButton
                                    text={post.content}
                                    size="sm"
                                    variant="ghost"
                                    onCopy={() => toast.success('Copied!')}
                                  />
                                  <EditButton
                                    size="sm"
                                    onClick={() => startEdit(platform, index, post.content)}
                                    text=""
                                  />
                                  <SaveButton
                                    size="sm"
                                    onClick={() => handleSavePost(post.content, platform)}
                                    text=""
                                  />

                                  {/* Platform-specific share buttons */}
                                  {platform === "linkedin" && (
                                    <LinkedInShareButton
                                      size="sm"
                                      text=""
                                      onClick={async () => {
                                        try {
                                          const response = await fetch('/api/share/linkedin', {
                                            method: 'POST',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              ...(userEmail ? {
                                                'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`
                                              } : {})
                                            },
                                            body: JSON.stringify({ content: post.content })
                                          });

                                          const result = await response.json();

                                          if (result.success) {
                                            toast.success("LinkedIn draft created! 🚀");
                                            if (result.linkedinUrl) {
                                              window.open(result.linkedinUrl, "_blank");
                                            }
                                          } else {
                                            const linkedinUrl = createLinkedInShareUrl(post.content);
                                            window.open(linkedinUrl, "_blank");
                                          }
                                        } catch (error) {
                                          const linkedinUrl = createLinkedInShareUrl(post.content);
                                          window.open(linkedinUrl, "_blank");
                                        }
                                      }}
                                    />
                                  )}
                                  {platform === "x" && (
                                    <XShareButton
                                      size="sm"
                                      text=""
                                      tweetContent={post.content}
                                    />
                                  )}
                                  {platform === "instagram" && (
                                    <InstagramShareButton
                                      size="sm"
                                      text=""
                                      postContent={post.content}
                                    />
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {Object.keys(generatedPosts).every(platform =>
          !generatedPosts[platform as Platform]?.length
        ) && currentContent.trim() && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to generate
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Select platforms and click generate to create your posts
            </p>
          </div>
        )}
      </main>

      {/* Voice Tone Selector */}
      <VoiceToneSelector
        isOpen={isToneSelectorOpen}
        onClose={() => setIsToneSelectorOpen(false)}
        onSelectTone={(tone) => setCurrentTone(tone)}
        currentTone={currentTone}
      />

      {/* Mobile Saved Posts FAB */}
      <button
        onClick={bottomSheet.open}
        className="fixed bottom-6 right-6 md:hidden z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
        aria-label="Saved posts"
      >
        <Bookmark className="w-5 h-5" />
      </button>

      {/* Mobile Bottom Sheet for Saved Posts */}
      <MobileBottomSheet
        isOpen={bottomSheet.isOpen}
        onClose={bottomSheet.close}
        title="Saved Posts"
        snapPoints={[0.5, 0.95]}
        defaultSnapPoint={0}
      >
        <SavedPosts
          onCollapse={() => {}}
          refreshKey={refreshKey}
          isAuthenticated={!!userEmail}
          onLoginClick={() => {
            bottomSheet.close();
            setLoginOpen(true);
          }}
        />
      </MobileBottomSheet>

      {/* Desktop SavedPosts Sidebar with Collapse Handling */}
      <SavedPosts
        onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)}
        refreshKey={refreshKey}
        isAuthenticated={!!userEmail}
        onLoginClick={() => setLoginOpen(true)}
      />

    </div>
  );
}