'use client';

import { useEffect, useState } from 'react';
import { CallStatus, useCallStore } from '@/stores';
import { cn } from '@/lib/utils';

interface CallStatusIndicatorProps {
  status: CallStatus;
}

const statusConfig: Record<CallStatus, { icon: string; color: string; bgColor: string; text: string }> = {
  idle: {
    icon: '⚪',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    text: '대기 중',
  },
  connecting: {
    icon: '🟡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    text: '연결 중...',
  },
  active: {
    icon: '🟢',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    text: '통화 중',
  },
  hold: {
    icon: '🟠',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    text: '보류 중',
  },
  'wrap-up': {
    icon: '🔵',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    text: '마무리 중',
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CallStatusIndicator({ status }: CallStatusIndicatorProps) {
  const { callDuration, updateDuration, startedAt } = useCallStore();
  const [displayDuration, setDisplayDuration] = useState(0);
  const config = statusConfig[status];

  useEffect(() => {
    if (status === 'active' && startedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        setDisplayDuration(elapsed);
        updateDuration(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, startedAt, updateDuration]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
        config.bgColor,
        config.color
      )}
    >
      <span>{config.icon}</span>
      <span>
        {config.text}
        {status === 'active' && ` ${formatDuration(displayDuration)}`}
      </span>
    </div>
  );
}
