import { useEffect, useState } from 'react'
import { SavedPost, getSavedPosts, deleteSavedPost, updateSavedPost } from '../api/supabase'

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
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(post.id, editingPost.content)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  <div className="mt-4 flex justify-end">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingPost({ id: post.id, content: post.content })}
                        className="inline-flex items-center p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                        title="Beitrag bearbeiten"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=&summary=${encodeURIComponent(post.content)}`
                          window.open(linkedinUrl, '_blank')
                        }}
                        className="inline-flex items-center p-2 text-blue-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                        title="Auf LinkedIn als Draft posten"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center p-2 text-red-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                        title="Beitrag löschen"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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