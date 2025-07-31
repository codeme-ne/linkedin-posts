import React from 'react'
import { Save } from 'lucide-react'
import { Button } from '../Button'
import { ButtonProps } from '../Button/Button.types'

interface SaveButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  text = 'Speichern',
  ...props 
}) => {
  return (
    <Button
      variant="primary"
      leftIcon={<Save size={16} />}
      {...props}
    >
      {text}
    </Button>
  )
}