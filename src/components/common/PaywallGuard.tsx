import { ReactNode } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { ButtonCheckout } from './ButtonCheckout'
import { getDefaultStripePlan } from '@/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Star, TrendingUp } from 'lucide-react'

interface PaywallGuardProps {
  children: ReactNode
  feature?: string
  className?: string
}

// ShipFast-inspired paywall guard
// Simple access control using hasAccess pattern
export function PaywallGuard({ children, feature = 'Premium Feature', className = '' }: PaywallGuardProps) {
  const { hasAccess, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  // ShipFast pattern: Clean upgrade prompt with direct checkout
  const defaultPlan = getDefaultStripePlan()

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Premium Feature</CardTitle>
          <CardDescription>
            {feature} ist nur für Pro-Nutzer verfügbar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-left space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span>Unbegrenzte Content-Generierung</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Premium URL-Extraktion</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Alle Plattformen & Features</span>
            </div>
          </div>
          
          <ButtonCheckout
            priceId={defaultPlan.priceId}
            mode="payment"
            className="w-full"
          >
            Jetzt upgraden für €{defaultPlan.price}
          </ButtonCheckout>
          
          <p className="text-xs text-muted-foreground">
            {defaultPlan.interval === 'lifetime' && 'Einmalige Zahlung • Lebenslanger Zugang'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}