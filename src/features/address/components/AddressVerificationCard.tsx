'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAddressStore } from '@/stores/address-store';
import { useCallStore } from '@/stores';
import type { AddressResult } from '@/types/address';
import { AddressResultItem } from './AddressResultItem';

interface AddressVerificationCardProps {
  transcriptId: string;
  onClose: () => void;
}

export function AddressVerificationCard({ transcriptId, onClose }: AddressVerificationCardProps) {
  const updateCustomerAddress = useCallStore((state) => state.updateCustomerAddress);
  const search = useAddressStore((state) => state.getSearch(transcriptId));

  const handleSelectAddress = (result: AddressResult) => {
    // CallStore에 주소 저장
    updateCustomerAddress({
      roadAddr: result.roadAddr,
      jibunAddr: result.jibunAddr,
      zipNo: result.zipNo,
      siNm: result.siNm,
      sggNm: result.sggNm,
      emdNm: result.emdNm,
      bdNm: result.bdNm,
      verifiedAt: new Date(),
    });

    // Toast 알림
    toast({
      title: '주소가 저장되었습니다',
      description: result.roadAddr,
    });

    // 카드 닫기
    onClose();
  };

  if (!search) {
    return null;
  }

  const { keyword, results, loading, error } = search;

  return (
    <Card className="max-w-md mt-2 shadow-md animate-in fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            주소 검색 결과
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">검색어: {keyword}</p>
      </CardHeader>

      <CardContent className="pt-0">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive p-4 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-sm text-muted-foreground text-center p-4">
            검색 결과가 없습니다. 더 구체적인 주소를 입력해주세요.
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {results.map((result, index) => (
                  <AddressResultItem
                    key={`${result.bdMgtSn}-${index}`}
                    result={result}
                    onSelect={handleSelectAddress}
                  />
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              총 {results.length}건
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
