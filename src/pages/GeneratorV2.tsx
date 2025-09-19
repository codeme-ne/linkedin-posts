import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

// Feature flag and layout components
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { UnifiedLayout } from "@/components/layouts/UnifiedLayout";
import { WorkflowStepper, type WorkflowStep } from "@/components/common/WorkflowStepper";
import { EnhancedUrlExtractor } from "@/components/common/EnhancedUrlExtractor";
import { CharacterCounterTextarea } from "@/components/common/CharacterCounter";
import {
  ExtractingContent,
  GeneratingPosts
} from "@/components/common/SkeletonLoaders";

// Existing components and hooks
import { SavedPosts } from "@/components/common/SavedPosts";
import { AccountButton } from "@/components/common/AccountButton";
import { Auth } from "@/components/common/Auth";
import PlatformGenerators from "@/components/common/PlatformGenerators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import {
  SaveButton,
  EditButton,
  LinkedInShareButton,
  XShareButton,
  InstagramShareButton,
} from "@/design-system/components/ActionButtons";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlExtraction } from "@/hooks/useUrlExtraction";
import { usePostEditing } from "@/hooks/usePostEditing";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { usePostGeneratorState, type GeneratedPost } from "@/hooks/usePostGeneratorState";

// Performance monitoring
import { perfMonitor, PERF_MARKS, PERF_MEASURES } from "@/utils/performance";

// Types
import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL } from "@/config/platforms";
import { savePost } from "@/api/supabase";
import {
  createLinkedInDraftPost,
  createLinkedInShareUrl
} from "@/api/linkedin";

// Import existing Generator for fallback
import GeneratorV1 from "./Generator";

export default function GeneratorV2() {
  // Feature flag check
  const newUxEnabled = useFeatureFlag('NEW_UX', {
    rolloutPercentage: 10,
    analyticsEnabled: true
  });

  // If feature flag is disabled, use existing Generator
  if (!newUxEnabled) {
    return <GeneratorV1 />;
  }

  // Mark app initialization
  useEffect(() => {
    perfMonitor.mark(PERF_MARKS.APP_INIT);
  }, []);

  // Unified state management
  const { state, actions, computed } = usePostGeneratorState();

  // Local UI state only
  const [refreshKey, setRefreshKey] = useState(0);
  const [, setIsSidebarCollapsed] = useState(false);

  // Custom hooks
  const { userEmail, loginOpen, setLoginOpen, searchParams } = useAuth();
  const { hasAccess } = useSubscription();
  const {
    // canGenerate, // Reserved for future use
    isPremium,
    checkAndIncrementUsage
  } = useUsageTracking();

  // const canExtract = () => isPremium || canGenerate; // Reserved for future use
  const isPro = hasAccess || isPremium;
  const { postsByPlatform, setPostsByPlatform } = useContentGeneration();
  const { extractionUsage, extractContent } = useUrlExtraction();
  const { editing, editedContent, setEditedContent, startEdit, cancelEdit, isEditing } = usePostEditing();

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

  // Update workflow step based on state
  useEffect(() => {
    if (state.inputText.trim()) {
      if (!state.completedSteps.includes('input')) {
        actions.completeStep('input');
        actions.setStep('generate');
      }
    }

    const hasGeneratedPosts = Object.values(postsByPlatform).some(posts => posts.length > 0);
    if (hasGeneratedPosts) {
      if (!state.completedSteps.includes('generate')) {
        actions.completeStep('generate');
        actions.setStep('share');
        perfMonitor.mark(PERF_MARKS.FIRST_POST_RENDERED);
      }
    }
  }, [state.inputText, postsByPlatform, state.completedSteps, actions]);

  // Enhanced extraction handler
  const handleExtract = useCallback(async (url: string, usePremium: boolean = false) => {
    if (!url) return;

    perfMonitor.mark(PERF_MARKS.EXTRACTION_START);
    actions.startExtraction();
    actions.setPremiumExtraction(usePremium);

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
      actions.failExtraction('Usage limit reached');
      return;
    }

    try {
      const result = await extractContent(url, usePremium, isPro);
      if (result) {
        const prefill = [result.title, result.content]
          .filter(Boolean)
          .join("\n\n");
        actions.completeExtraction(prefill);
        actions.setSourceUrl(url);

        perfMonitor.mark(PERF_MARKS.EXTRACTION_END);
        perfMonitor.measure(PERF_MEASURES.EXTRACTION_DURATION, PERF_MARKS.EXTRACTION_START, PERF_MARKS.EXTRACTION_END);
      }
    } catch (error) {
      actions.failExtraction(error instanceof Error ? error.message : 'Extraction failed');
    }
  }, [checkAndIncrementUsage, extractContent, isPro, actions]);

  // Save post handler
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
    const { platform } = editing;
    actions.updatePost(platform, editedContent);
    cancelEdit();
  };

  // Handle step navigation
  const handleStepClick = (step: WorkflowStep) => {
    if (state.completedSteps.includes(step) || state.currentStep === step) {
      actions.setStep(step);
    }
  };

  // Render Input Area
  const InputArea = useMemo(() => (
    <div className="space-y-6">
      <EnhancedUrlExtractor
        value={state.inputText}
        onContentExtracted={handleExtract}
        onTextInput={actions.setInputText}
        isExtracting={state.isExtracting}
        isPro={isPro}
        usageRemaining={extractionUsage?.remaining}
        usePremiumExtraction={state.usePremiumExtraction}
        onPremiumToggle={actions.setPremiumExtraction}
      />

      {state.inputText.trim() && (
        <Card>
          <CardHeader>
            <CardTitle>Plattform-spezifische Generierung</CardTitle>
            <CardDescription>Erzeuge und regeneriere Beiträge pro Plattform</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformGenerators
              content={state.inputText}
              onPostGenerated={(platform, post) => {
                perfMonitor.mark(PERF_MARKS.GENERATION_END);
                const generatedPost: GeneratedPost = {
                  content: post,
                  platform,
                  isEdited: false,
                  regenerationCount: 0,
                  createdAt: new Date(),
                  characterCount: post.length
                };
                actions.completeGeneration(platform, generatedPost);
                setPostsByPlatform((prev: Record<Platform, string[]>) => ({
                  ...prev,
                  [platform]: [...(prev[platform] || []), post]
                }));
                toast.success(`${PLATFORM_LABEL[platform]} Post generiert!`);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  ), [state.inputText, state.isExtracting, state.usePremiumExtraction, handleExtract, actions, isPro, extractionUsage?.remaining]);

  // Render Output Area with loading states
  const OutputArea = useMemo(() => {
    // Show extraction loading state
    if (state.isExtracting) {
      return <ExtractingContent progress={state.extractionProgress} />;
    }

    // Show generation loading state
    if (computed.isGeneratingAny && state.generationProgress.current) {
      return <GeneratingPosts platform={state.generationProgress.current} />;
    }

    // Show generated posts
    return (
      <div className="space-y-6">
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
                            <CharacterCounterTextarea
                              value={editedContent}
                              onChange={setEditedContent}
                              platform={platform}
                              rows={8}
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
                              <Badge variant="outline" className="text-xs">
                                {PLATFORM_LABEL[platform]} · Post #{index + 1}
                              </Badge>
                              <div className="flex gap-2">
                                <CopyButton
                                  text={post}
                                  size="sm"
                                  variant="ghost"
                                  onCopy={() => toast.success('Beitrag kopiert!')}
                                />
                                <EditButton
                                  size="sm"
                                  onClick={() => startEdit(platform, index, post)}
                                  text=""
                                  title="Beitrag bearbeiten"
                                />
                                <SaveButton
                                  size="sm"
                                  onClick={() => handleSavePost(post, platform)}
                                  text=""
                                  title="Beitrag speichern"
                                />
                                {/* Platform-specific share buttons */}
                                {platform === "linkedin" && (
                                  <LinkedInShareButton
                                    size="sm"
                                    text=""
                                    onClick={async () => {
                                      try {
                                        const accessToken = import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN;
                                        const authorUrn = import.meta.env.VITE_LINKEDIN_AUTHOR_URN;
                                        const hasValidCredentials =
                                          accessToken &&
                                          authorUrn &&
                                          !accessToken.includes('YOUR_') &&
                                          !authorUrn.includes('YOUR_');

                                        if (hasValidCredentials) {
                                          const result = await createLinkedInDraftPost(post, { accessToken, authorUrn });
                                          window.open(result.draftUrl, "_blank");
                                          toast.success("LinkedIn Draft erstellt! 🚀");
                                        } else {
                                          const linkedinUrl = createLinkedInShareUrl(post);
                                          window.open(linkedinUrl, "_blank");
                                        }
                                      } catch (error) {
                                        const linkedinUrl = createLinkedInShareUrl(post);
                                        window.open(linkedinUrl, "_blank");
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

        {/* Placeholder when no posts */}
        {Object.values(postsByPlatform).every(posts => posts.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Noch keine Posts generiert</p>
            <p className="text-sm mt-2">Füge Content hinzu und generiere Posts</p>
          </div>
        )}
      </div>
    );
  }, [state.isExtracting, state.extractionProgress, state.generationProgress, computed.isGeneratingAny, postsByPlatform, isEditing, editedContent, setEditedContent,
      cancelEdit, handleSaveEdit, startEdit, handleSavePost, actions]);

  // Main render with UnifiedLayout
  return (
    <UnifiedLayout
      header={
        <div className="space-y-4">
          {/* Top bar with account */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Social Transformer
            </h1>
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

          {/* Workflow Stepper */}
          <WorkflowStepper
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      }
      inputArea={InputArea}
      outputArea={OutputArea}
      sidebarArea={
        <SavedPosts
          onCollapse={setIsSidebarCollapsed}
          refreshKey={refreshKey}
          isAuthenticated={!!userEmail}
          onLoginClick={() => setLoginOpen(true)}
          initialExpanded={searchParams.get('expand') === 'saved'}
        />
      }
    />
  );
}