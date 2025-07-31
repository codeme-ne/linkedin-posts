import React from 'react'
import { Edit2 } from 'lucide-react'
import { Button } from '../Button'
import { ButtonProps } from '../Button/Button.types'

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