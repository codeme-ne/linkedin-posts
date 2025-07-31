import { useEffect, useState } from 'react'
import { SavedPost, getSavedPosts, deleteSavedPost, updateSavedPost } from '../api/supabase'
import { SaveButton, EditButton, DeleteButton, LinkedInShareButton } from '../design-system/components/ActionButtons'
import { Button } from '../design-system/components/Button'

interface SavedPostsProps {
  onCollapse: (collapsed: boolean) => void;
  refreshKey?: number;
}

export function SavedPosts({ onCollapse, refreshKey }: SavedPostsProps) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editingPost, setEditingPost] = useState<{ id: number, content: string } | null>(null)

  useEffect(() => {
    loadSavedPosts()
  }, [refreshKey])

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
    <div className={`fixed right-0 top-0 h-screen bg-white shadow-lg transition-transform duration-300 ${isCollapsed ? 'translate-x-[calc(100%-2rem)]' : 'translate-x-0'}`} style={{ width: '20rem' }}>
      <div className="flex items-center relative">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg absolute left-0 z-30 bg-white"
          style={{ boxShadow: isCollapsed ? '-4px 0 8px rgba(0,0,0,0.1)' : 'none' }}
        >
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800 p-4 pl-12 relative z-10">Gespeicherte Beiträge</h2>
      </div>
      
      <div className="relative overflow-hidden">
        {isCollapsed && (
          <div className="absolute inset-0 bg-white z-20" style={{ left: '-2rem', width: 'calc(100% + 2rem)' }} />
        )}
        <div className="relative p-4 space-y-4 overflow-y-auto z-10" style={{ height: 'calc(100vh - 4rem)' }}>
          {savedPosts.map((post) => (
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
                        title="Beitrag bearbeiten"
                      />
                      <LinkedInShareButton
                        postContent={post.content}
                        size="sm"
                        text="Teilen"
                        title="Auf LinkedIn als Draft posten"
                      />
                      <DeleteButton
                        onClick={() => handleDelete(post.id)}
                        size="sm"
                        text=""
                        title="Beitrag löschen"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 