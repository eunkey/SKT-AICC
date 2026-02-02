'use client';

import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';

interface JumpToLiveButtonProps {
  onClick: () => void;
}

export function JumpToLiveButton({ onClick }: JumpToLiveButtonProps) {
  const { isJumpToLiveVisible } = useUIStore();

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lg transition-all duration-200',
        isJumpToLiveVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      onClick={onClick}
    >
      <ArrowDown className="w-4 h-4 mr-1" />
      실시간으로 이동
    </Button>
  );
}
