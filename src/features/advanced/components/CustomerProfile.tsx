'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Cake, CreditCard, CheckCircle2 } from 'lucide-react';
import { useCallStore } from '@/stores';
import { format } from 'date-fns';

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
  const customerInfo = useCallStore((state) => state.customerInfo);
  const verifiedAddress = customerInfo?.address;

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

        {/* 검증된 주소 섹션 */}
        {verifiedAddress && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    검증된 주소
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {format(verifiedAddress.verifiedAt, 'MM/dd HH:mm')}
                  </span>
                </div>
                <p className="text-sm font-medium">{verifiedAddress.roadAddr}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {verifiedAddress.jibunAddr} [{verifiedAddress.zipNo}]
                </p>
                {verifiedAddress.bdNm && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {verifiedAddress.bdNm}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
