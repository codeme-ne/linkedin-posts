import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedContentGeneration } from '@/hooks/useEnhancedContentGeneration';
import type { Platform } from '@/config/platforms';
import type { PostGoal } from '@/libs/promptBuilder.v2';

const POST_GOALS: { value: PostGoal; label: string; description: string }[] = [
  { value: 'thought_leadership', label: 'Thought Leadership', description: 'Aufbau von Expertise und Autorität' },
  { value: 'drive_traffic', label: 'Traffic Drive', description: 'Weiterleitung zu Blog/Website' },
  { value: 'promote_feature', label: 'Feature Promotion', description: 'Bewerbung neuer Features/Produkte' },
  { value: 'start_conversation', label: 'Conversation Starter', description: 'Diskussion und Engagement fördern' },
  { value: 'share_lessons', label: 'Share Lessons', description: 'Erfahrungen und Lektionen teilen' },
  { value: 'build_awareness', label: 'Build Awareness', description: 'Bewusstsein für Thema schaffen' }
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' }
];

export const EnhancedGenerator: React.FC = () => {
  const [inputContent, setInputContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('linkedin');
  const [selectedGoal, setSelectedGoal] = useState<PostGoal>('thought_leadership');
  const [activeTab, setActiveTab] = useState<'single' | 'comparison'>('single');

  const {
    enhancedPosts,
    comparisonResults,
    generateEnhancedSinglePost,
    regenerateEnhancedPost,
    generatePostComparison,
    changePostGoal,
    getGenerationMetadata,
    updateEnhancedPost,
    isEnhancedGenerating,
    clearEnhancedPosts
  } = useEnhancedContentGeneration();

  const currentPost = enhancedPosts[selectedPlatform];
  const currentComparison = comparisonResults[selectedPlatform];
  const isGenerating = isEnhancedGenerating(selectedPlatform);

  const handleGenerate = async () => {
    if (!inputContent.trim()) return;
    try {
      await generateEnhancedSinglePost(inputContent, selectedPlatform, selectedGoal);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!inputContent.trim()) return;
    try {
      await regenerateEnhancedPost(inputContent, selectedPlatform, selectedGoal);
    } catch (error) {
      console.error('Regeneration failed:', error);
    }
  };

  const handleComparison = async () => {
    if (!inputContent.trim()) return;
    try {
      await generatePostComparison(inputContent, selectedPlatform, selectedGoal);
    } catch (error) {
      console.error('Comparison failed:', error);
    }
  };

  const handleGoalChange = async (newGoal: PostGoal) => {
    setSelectedGoal(newGoal);
    if (currentPost && inputContent.trim()) {
      try {
        await changePostGoal(inputContent, selectedPlatform, newGoal);
      } catch (error) {
        console.error('Goal change failed:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Enhanced Social Media Generator</h1>
        <p className="text-gray-600">
          Strukturierte Prompt-Engine mit Hook-Formeln, Storytelling-Frameworks und Goal-Alignment
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content Input</CardTitle>
          <CardDescription>
            Gib deinen Newsletter, Blog-Post oder Content ein
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Füge hier deinen Content ein..."
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            className="min-h-32"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform Selection */}
            <div>
              <Label>Plattform</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map((platform) => (
                  <Button
                    key={platform.value}
                    variant={selectedPlatform === platform.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform.value)}
                  >
                    {platform.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Goal Selection */}
            <div>
              <Label>Post-Ziel</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {POST_GOALS.map((goal) => (
                  <Button
                    key={goal.value}
                    variant={selectedGoal === goal.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGoalChange(goal.value)}
                    title={goal.description}
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'comparison')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Enhanced Generation</TabsTrigger>
              <TabsTrigger value="comparison">Old vs New Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!inputContent.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? 'Generiere...' : 'Generate Enhanced Post'}
                </Button>
                {currentPost && (
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={!inputContent.trim() || isGenerating}
                  >
                    Regenerate
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={clearEnhancedPosts}
                  disabled={isGenerating}
                >
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Button
                onClick={handleComparison}
                disabled={!inputContent.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generiere Vergleich...' : 'Generate A/B Comparison'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Section */}
      {activeTab === 'single' && currentPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Enhanced {selectedPlatform.toUpperCase()} Post
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {currentPost.metadata.hook_formula_used}
                </Badge>
                <Badge variant="outline">
                  {currentPost.metadata.storytelling_framework_used}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Goal: {selectedGoal} | Regenerations: {currentPost.regenerationCount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={currentPost.post}
              onChange={(e) => updateEnhancedPost(selectedPlatform, e.target.value)}
              className="min-h-40"
            />

            {currentPost.hashtags && currentPost.hashtags.length > 0 && (
              <div>
                <Label>Suggested Hashtags:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentPost.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="outline">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label>Hook Formula:</Label>
                <p className="text-gray-600">{currentPost.metadata.hook_formula_used}</p>
              </div>
              <div>
                <Label>Framework:</Label>
                <p className="text-gray-600">{currentPost.metadata.storytelling_framework_used}</p>
              </div>
              <div>
                <Label>Engagement:</Label>
                <p className="text-gray-600">{currentPost.metadata.engagement_trigger_used}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {activeTab === 'comparison' && currentComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old System Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Old System</CardTitle>
              <CardDescription>
                Legacy prompt system ({currentComparison.old.count} posts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentComparison.old.posts.map((post, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded border">
                    <div className="text-sm text-gray-600 mb-2">Post {index + 1}:</div>
                    <div className="whitespace-pre-wrap">{post}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New System Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Enhanced System</CardTitle>
              <CardDescription>
                Structured prompt with frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded border">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentComparison.new.metadata.hook_formula_used}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentComparison.new.metadata.storytelling_framework_used}
                    </Badge>
                  </div>
                  <div className="whitespace-pre-wrap">{currentComparison.new.post}</div>
                </div>

                {currentComparison.new.hashtags && (
                  <div>
                    <Label>Hashtags:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentComparison.new.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm space-y-1">
                  <div><strong>Framework:</strong> {currentComparison.new.metadata.storytelling_framework_used}</div>
                  <div><strong>Engagement:</strong> {currentComparison.new.metadata.engagement_trigger_used}</div>
                  <div><strong>Goal:</strong> {currentComparison.new.metadata.post_goal}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};