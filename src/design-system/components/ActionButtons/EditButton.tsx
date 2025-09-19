import React from 'react'
import { Edit2 } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface EditButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
}

export const EditButton: React.FC<EditButtonProps> = ({
  text = 'Bearbeiten',
  ...props
}) => {
  const hasText = text && text.length > 0;

  return (
    <Button
      variant="secondary"
      leftIcon={<Edit2 size={16} aria-hidden="true" />}
      aria-label={hasText ? undefined : 'Bearbeiten'}
      title={hasText ? undefined : 'Bearbeiten'}
      {...props}
    >
      {text}
    </Button>
  )
}