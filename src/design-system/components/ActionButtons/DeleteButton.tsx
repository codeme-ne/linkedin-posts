import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface DeleteButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  text = 'Löschen',
  ...props 
}) => {
  return (
    <Button
      variant="destructive"
      leftIcon={<Trash2 size={16} />}
      {...props}
    >
      {text}
    </Button>
  )
}