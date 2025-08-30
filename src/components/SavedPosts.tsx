import { useEffect, useState } from 'react'
import { SavedPost, getSavedPosts, deleteSavedPost, updateSavedPost } from '../api/supabase'
import { SaveButton, EditButton, DeleteButton, LinkedInShareButton, XShareButton, InstagramShareButton } from '../design-system/components/ActionButtons'
import { Button } from '../design-system/components/Button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface SavedPostsProps {
  onCollapse: (collapsed: boolean) => void;
  refreshKey?: number;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

export function SavedPosts({ onCollapse, refreshKey, isAuthenticated, onLoginClick }: SavedPostsProps) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editingPost, setEditingPost] = useState<{ id: number, content: string } | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedPosts()
    } else {
      setSavedPosts([])
    }
  }, [refreshKey, isAuthenticated])

  useEffect(() => {
    onCollapse(isCollapsed)
  }, [isCollapsed, onCollapse])

  const loadSavedPosts = async () => {
    try {
      const posts = await getSavedPosts()
      setSavedPosts(posts)
    } catch (error) {
      console.error('Failed to load saved posts:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteSavedPost(id)
      setSavedPosts(posts => posts.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleEdit = async (id: number, newContent: string) => {
    try {
      await updateSavedPost(id, newContent)
      setSavedPosts(posts => posts.map(p => 
        p.id === id ? { ...p, content: newContent } : p
      ))
      setEditingPost(null)
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  return (
    <>
  {/* Mobile: Bottom drawer */}
  <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 z-40 pb-[env(safe-area-inset-bottom)] ${isCollapsed ? 'translate-y-[calc(100%-3rem)]' : 'translate-y-0'}`} style={{ maxHeight: '50vh' }}>
  <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-bold text-gray-800">Gespeicherte Beiträge</h2>
          <div className="flex items-center gap-1">
            <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          </div>
        </div>
  <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(50vh - 4rem)' }}>
          {!isAuthenticated ? (
            <div className="p-4 rounded-lg border border-gray-200 bg-white text-center space-y-2">
              <p className="text-gray-700 text-sm">Bitte logge dich ein, um gespeicherte Beiträge zu sehen.</p>
              {onLoginClick && (
                <Button onClick={onLoginClick} variant="primary" size="sm">Login</Button>
              )}
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
              <p className="text-gray-700 text-sm">Noch keine gespeicherten Beiträge.</p>
            </div>
          ) : savedPosts.map((post) => (
            <div key={post.id} className="p-3 rounded-lg border border-gray-200 bg-white">
              {editingPost?.id === post.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setEditingPost(null)}
                      variant="ghost"
                      size="sm"
                    >
                      Abbrechen
                    </Button>
                    <SaveButton
                      onClick={() => handleEdit(post.id, editingPost.content)}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 whitespace-pre-wrap text-sm">{post.content}</p>
                  <div className="mt-3 flex justify-end">
                    <div className="flex gap-1">
                      <EditButton
                        onClick={() => setEditingPost({ id: post.id, content: post.content })}
                        size="sm"
                        text=""
                        title="Beitrag bearbeiten"
                      />
                      {post.platform === 'x' ? (
                        <XShareButton
                          tweetContent={post.content}
                          size="sm"
                          text=""
                          title="Auf X teilen"
                        />
                      ) : post.platform === 'instagram' ? (
                        <InstagramShareButton
                          postContent={post.content}
                          size="sm"
                          text=""
                          title="Auf Instagram teilen"
                        />
                      ) : (
                        <LinkedInShareButton
                          postContent={post.content}
                          size="sm"
                          text=""
                          title="Auf LinkedIn teilen"
                        />
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div>
                            <DeleteButton
                              size="sm"
                              text=""
                              title="Beitrag löschen"
                            />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Möchtest du diesen Beitrag wirklich löschen?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nein</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(post.id)}
                            >
                              Ja
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Side panel (full right edge, below header) */}
      <div
        className={`hidden md:block fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-transform duration-300 z-20 ${isCollapsed ? 'translate-x-[calc(100%-3rem)]' : 'translate-x-0'}`}
        style={{ width: '22rem' }}
      >
        <div className="h-full flex flex-col">
          {/* Header with collapse button */}
          <div className="flex items-center h-16 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-3 hover:bg-gray-100 transition-colors duration-200"
              aria-label={isCollapsed ? "Seitenleiste öffnen" : "Seitenleiste schließen"}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h2 className={`text-lg font-semibold text-gray-800 py-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              Gespeicherte Beiträge
            </h2>
          </div>
          
          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            <div className={`p-4 space-y-4 overflow-y-auto h-full transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {!isAuthenticated ? (
            <div className="p-4 rounded-lg border border-gray-200 bg-white text-center space-y-2">
              <p className="text-gray-700">Bitte logge dich ein, um gespeicherte Beiträge zu sehen.</p>
              {onLoginClick && (
                <Button onClick={onLoginClick} variant="primary" size="sm">Login</Button>
              )}
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="p-4 rounded-lg border border-gray-200 bg-white text-center">
              <p className="text-gray-700">Noch keine gespeicherten Beiträge.</p>
            </div>
          ) : savedPosts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg border border-gray-200 bg-white">
              {editingPost?.id === post.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setEditingPost(null)}
                      variant="ghost"
                      size="sm"
                    >
                      Abbrechen
                    </Button>
                    <SaveButton
                      onClick={() => handleEdit(post.id, editingPost.content)}
                      size="sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  <div className="mt-4 flex justify-end">
                    <div className="flex gap-2">
                      <EditButton
                        onClick={() => setEditingPost({ id: post.id, content: post.content })}
                        size="sm"
                        text=""
                        title="Beitrag bearbeiten"
                      />
                      {post.platform === 'x' ? (
                        <XShareButton
                          tweetContent={post.content}
                          size="sm"
                          text=""
                          title="Auf X teilen"
                        />
                      ) : post.platform === 'instagram' ? (
                        <InstagramShareButton
                          postContent={post.content}
                          size="sm"
                          text=""
                          title="Auf Instagram teilen"
                        />
                      ) : (
                        <LinkedInShareButton
                          postContent={post.content}
                          size="sm"
                          text=""
                          title="Auf LinkedIn teilen"
                        />
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div>
                            <DeleteButton
                              size="sm"
                              text=""
                              title="Beitrag löschen"
                            />
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Möchtest du diesen Beitrag wirklich löschen?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nein</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(post.id)}
                            >
                              Ja
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 