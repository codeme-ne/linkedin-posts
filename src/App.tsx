import { useState } from 'react'
import { linkedInPostsFromNewsletter } from './api/claude'
import { savePost } from './api/supabase'
import { SavedPosts } from './components/SavedPosts'
import { createLinkedInDraftPost, createLinkedInShareUrl, LinkedInAPIError } from './api/linkedin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Edit, Save, Loader2 } from 'lucide-react'

// LinkedIn Icon Component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

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
        title: "LinkedIn-Beiträge erstellt! ✨",
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
            Newsletter zu LinkedIn
          </h1>
          <p className="text-muted-foreground text-lg">
            Verwandle deinen Post in ansprechende LinkedIn-Beiträge
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
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(index)}
                            >
                              Speichern
                            </Button>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(index, post)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSavePost(post)}
                                className="h-8 w-8 p-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
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
                                className="h-8 w-8 p-0 text-accent hover:text-accent/80 hover:bg-accent/10"
                              >
                                <LinkedInIcon className="h-4 w-4" />
                              </Button>
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
