'use client';

import { Button } from '@/components/ui/button';
import type { AddressResult } from '@/types/address';
import { formatRoadAddress, formatJibunAddress, formatBuildingName } from '../utils/address-utils';

interface AddressResultItemProps {
  result: AddressResult;
  onSelect: (result: AddressResult) => void;
}

export function AddressResultItem({ result, onSelect }: AddressResultItemProps) {
  const buildingName = formatBuildingName(result);

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent"
      onClick={() => onSelect(result)}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="font-medium text-sm">{formatRoadAddress(result)}</div>
        <div className="text-xs text-muted-foreground">{formatJibunAddress(result)}</div>
        {buildingName && (
          <div className="text-xs text-muted-foreground italic">{buildingName}</div>
        )}
      </div>
    </Button>
  );
}
