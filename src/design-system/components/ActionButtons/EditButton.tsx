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
  return (
    <Button
      variant="secondary"
      leftIcon={<Edit2 size={16} />}
      {...props}
    >
      {text}
    </Button>
  )
}