import React from 'react'
import { Save } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface SaveButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'children'> {
  text?: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  text = 'Speichern',
  ...props 
}) => {
  return (
    <Button
      variant="default"
      leftIcon={<Save size={16} />}
      {...props}
    >
      {text}
    </Button>
  )
}