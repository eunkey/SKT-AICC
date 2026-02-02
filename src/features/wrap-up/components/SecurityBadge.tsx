'use client';

import { Badge } from '@/components/ui/badge';
import { getSecurityBadgeInfo, SecurityBadgeStatus } from '@/lib/pii-masking';
import { cn } from '@/lib/utils';

interface SecurityBadgeProps {
  status: SecurityBadgeStatus;
}

export function SecurityBadge({ status }: SecurityBadgeProps) {
  const info = getSecurityBadgeInfo(status);

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5', info.color)}
    >
      <span>{info.icon}</span>
      {info.text}
    </Badge>
  );
}
