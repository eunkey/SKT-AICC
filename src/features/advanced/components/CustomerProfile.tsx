'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Cake, CreditCard } from 'lucide-react';

interface CustomerProfileProps {
  name: string;
  phone: string;
  gender: string;
  age: number;
  location: string;
  currentPlan: string;
}

export function CustomerProfile({
  name,
  phone,
  gender,
  age,
  location,
  currentPlan,
}: CustomerProfileProps) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4" />
          고객 프로필
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">고객명</p>
              <p className="text-sm font-medium">{name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">성별</p>
              <p className="text-sm font-medium">{gender}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cake className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">나이</p>
              <p className="text-sm font-medium">{age}세</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">전화번호</p>
              <p className="text-sm font-medium">{phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">거주지</p>
              <p className="text-sm font-medium">{location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">현재 요금제</p>
              <Badge variant="secondary" className="mt-1">
                {currentPlan}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
