import { useState } from 'react'
import type { Platform } from '@/config/platforms'

interface EditingState {
  platform: Platform
  index: number
}

export const usePostEditing = () => {
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [editedContent, setEditedContent] = useState("")

  const startEdit = (platform: Platform, index: number, content: string) => {
    setEditing({ platform, index })
    setEditedContent(content)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditedContent("")
  }

  const isEditing = (platform: Platform, index: number) => {
    return editing?.platform === platform && editing?.index === index
  }

  return {
    editing,
    editedContent,
    setEditedContent,
    startEdit,
    cancelEdit,
    isEditing,
  }
}