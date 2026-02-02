'use client';

import { useState } from 'react';
import { TranscriptEntry } from '@/stores';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAddressStore } from '@/stores';
import { useAddressDetection } from '@/features/address/hooks/useAddressDetection';
import { AddressVerificationCard } from '@/features/address/components';

interface TranscriptItemProps {
  transcript: TranscriptEntry;
}

export function TranscriptItem({ transcript }: TranscriptItemProps) {
  const isCustomer = transcript.speaker === 'customer';
  const [showAddressCard, setShowAddressCard] = useState(true);
  const clearSearch = useAddressStore((state) => state.clearSearch);

  // 주소 자동 감지
  const { search } = useAddressDetection({
    transcriptId: transcript.id,
    text: transcript.text,
    isFinal: transcript.isFinal,
    role: isCustomer ? 'user' : 'assistant',
  });

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex gap-3',
          isCustomer ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        {/* Speaker Label */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-8 rounded-lg flex items-center justify-center text-xs font-medium',
            isCustomer
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          )}
        >
          {isCustomer ? '고객' : '상담사'}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'flex-1 max-w-[80%] rounded-lg px-4 py-2 transition-all',
            isCustomer
              ? 'bg-slate-100 text-slate-900'
              : 'bg-primary/10 text-slate-900',
            !transcript.isFinal && 'opacity-70 border-2 border-dashed',
            !transcript.isFinal && (isCustomer ? 'border-blue-300' : 'border-green-300')
          )}
        >
          <p className={cn(
            'text-sm leading-relaxed',
            !transcript.isFinal && 'text-gray-600 italic animate-pulse'
          )}>
            {transcript.text}
            {!transcript.isFinal && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {format(transcript.timestamp, 'HH:mm:ss')}
            {!transcript.isFinal && (
              <span className="ml-1 text-blue-600 font-medium">
                ● 실시간 인식 중...
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Address Verification Card */}
      {search && showAddressCard && (
        <div className={cn('ml-15', !isCustomer && 'mr-15')}>
          <AddressVerificationCard
            transcriptId={transcript.id}
            onClose={() => {
              setShowAddressCard(false);
              clearSearch(transcript.id);
            }}
          />
        </div>
      )}
    </div>
  );
}
