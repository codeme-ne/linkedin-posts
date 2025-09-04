import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MemoizedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const MemoizedCard: React.FC<MemoizedCardProps> = React.memo(({
  title,
  description,
  children,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

export default MemoizedCard;