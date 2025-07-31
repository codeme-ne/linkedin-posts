import { useState } from 'react'
import { linkedInPostsFromNewsletter } from './api/claude'
import { savePost } from './api/supabase'
import { SavedPosts } from './components/SavedPosts'
import { createLinkedInDraftPost, createLinkedInShareUrl, LinkedInAPIError } from './api/linkedin'
import { Button } from '@/components/ui/button'
import { SaveButton, EditButton, LinkedInShareButton } from './design-system/components/ActionButtons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Loader2 } from 'lucide-react'

function App() {
  const [inputText, setInputText] = useState('')
  const [posts, setPosts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const { toast } = useToast()

  const handleRemix = async () => {
    setIsLoading(true)
    try {
      const remixedPosts = await linkedInPostsFromNewsletter(inputText)
      setPosts(remixedPosts)
      toast({
        title: "LinkedIn-Beiträge erstellt!",
        description: `${remixedPosts.length} Beiträge wurden erfolgreich generiert.`,
      })
    } catch (error) {
      toast({
        title: "Fehler beim Erstellen",
        description: "LinkedIn-Beiträge konnten nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePost = async (content: string) => {
    try {
      await savePost(content)
      setRefreshKey(prev => prev + 1)
      toast({
        title: "Beitrag gespeichert! 💾",
        description: "Der Beitrag wurde erfolgreich gespeichert.",
      })
    } catch (error) {
      console.error('Save post error:', error)
      toast({
        title: "Speichern fehlgeschlagen",
        description: `Fehler beim Speichern: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index)
    setEditedContent(content)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedContent('')
  }

  const handleSaveEdit = (index: number) => {
    const newPosts = [...posts]
    newPosts[index] = editedContent
    setPosts(newPosts)
    setEditingIndex(null)
    setEditedContent('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary p-8 overflow-x-hidden">
      <div className={`max-w-4xl mx-auto space-y-8 transition-transform duration-300 ${isSidebarCollapsed ? 'translate-x-[1.5rem]' : 'translate-x-[-10rem]'}`}>
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Newsletters zu LinkedIn-Beiträgen
          </h1>
          <p className="text-muted-foreground text-lg">
            Verwandle deinen Newsletter in ansprechende LinkedIn-Beiträge
          </p>
          <Badge variant="secondary" className="text-sm">
            Powered by Claude AI ✨
          </Badge>
        </div>
        
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              Newsletter eingeben
            </CardTitle>
            <CardDescription>
              Füge hier deinen Newsletter-Text ein, um daraus LinkedIn-Beiträge zu generieren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Newsletter hier einfügen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[12rem] text-base resize-none"
            />

            <Button
              onClick={handleRemix}
              disabled={isLoading || !inputText}
              size="lg"
              className="w-full text-lg h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  LinkedIn-Beiträge werden erstellt...
                </>
              ) : (
                <>
                  ✨ LinkedIn-Beiträge erstellen
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {posts.length > 0 && (
          <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>
                Generierte LinkedIn-Beiträge
              </CardTitle>
              <CardDescription>
                {posts.length} Beiträge wurden erfolgreich erstellt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post, index) => (
                  <Card 
                    key={index}
                    className="border-muted/50 hover:shadow-lg transition-all duration-200 hover:border-primary/20"
                  >
                    <CardContent className="p-6">
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[8rem]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Abbrechen
                            </Button>
                            <SaveButton
                              size="sm"
                              onClick={() => handleSaveEdit(index)}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">
                            {post}
                          </p>
                          <div className="flex justify-between items-center pt-4 border-t border-muted/30">
                            <Badge variant="outline" className="text-xs">
                              Post #{index + 1}
                            </Badge>
                            <div className="flex gap-2">
                              <EditButton
                                size="sm"
                                onClick={() => handleStartEdit(index, post)}
                                text=""
                                title="Beitrag bearbeiten"
                              />
                              <SaveButton
                                size="sm"
                                onClick={() => handleSavePost(post)}
                                text=""
                                title="Beitrag speichern"
                              />
                              <LinkedInShareButton
                                size="sm"
                                text=""
                                onClick={async () => {
                                  try {
                                    // Try LinkedIn API first if tokens are available
                                    const accessToken = import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN;
                                    const authorUrn = import.meta.env.VITE_LINKEDIN_AUTHOR_URN;
                                    
                                    if (accessToken && authorUrn) {
                                      const result = await createLinkedInDraftPost(post, {
                                        accessToken,
                                        authorUrn
                                      });
                                      window.open(result.draftUrl, '_blank');
                                      toast({
                                        title: "LinkedIn Draft erstellt! 🚀",
                                        description: "Der Draft wurde erfolgreich erstellt.",
                                      })
                                    } else {
                                      // Fallback to improved share dialog
                                      const linkedinUrl = createLinkedInShareUrl(post);
                                      window.open(linkedinUrl, '_blank');
                                    }
                                  } catch (error) {
                                    console.error('LinkedIn Draft Error:', error);
                                    if (error instanceof LinkedInAPIError) {
                                      toast({
                                        title: "LinkedIn API Fehler",
                                        description: error.message,
                                        variant: "destructive",
                                      })
                                    } else {
                                      // Fallback to share dialog on any error
                                      const linkedinUrl = createLinkedInShareUrl(post);
                                      window.open(linkedinUrl, '_blank');
                                    }
                                  }
                                }}
                                title="Auf LinkedIn teilen"
                              />
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
        )}
      </div>
      <SavedPosts 
        onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} 
        refreshKey={refreshKey}
      />
      <Toaster />
    </div>
  )
}

export default App
