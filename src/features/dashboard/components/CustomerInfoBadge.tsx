'use client';

import { Badge } from '@/components/ui/badge';
import { User, Phone } from 'lucide-react';

interface CustomerInfo {
  name: string;
  phone: string;
  customerId?: string;
}

interface CustomerInfoBadgeProps {
  customer: CustomerInfo;
}

export function CustomerInfoBadge({ customer }: CustomerInfoBadgeProps) {
  // 전화번호 마스킹
  const maskedPhone = customer.phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1.5">
        <User className="w-3 h-3" />
        {customer.name}
      </Badge>
      <Badge variant="outline" className="gap-1.5">
        <Phone className="w-3 h-3" />
        {maskedPhone}
      </Badge>
    </div>
  );
}
