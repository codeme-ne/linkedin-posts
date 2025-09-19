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
  const hasText = text && text.length > 0;

  return (
    <Button
      variant="destructive"
      leftIcon={<Trash2 size={16} aria-hidden="true" />}
      aria-label={hasText ? undefined : 'Löschen'}
      title={hasText ? undefined : 'Löschen'}
      {...props}
    >
      {text}
    </Button>
  )
}