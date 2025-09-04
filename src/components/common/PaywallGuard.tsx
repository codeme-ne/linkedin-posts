// DEPRECATED: This component is not being used anywhere in the codebase
// PaywallModal is being used instead for paywall functionality
// This file can be safely deleted

import { ReactNode } from "react";

interface PaywallGuardProps {
  children: ReactNode;
  feature?: string;
}

export function PaywallGuard({ children }: PaywallGuardProps) {
  console.warn('PaywallGuard is deprecated. Use PaywallModal instead.');
  return <>{children}</>;
}