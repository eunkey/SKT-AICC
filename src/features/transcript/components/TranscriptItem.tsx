'use client';

import { TranscriptEntry } from '@/stores';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TranscriptItemProps {
  transcript: TranscriptEntry;
}

export function TranscriptItem({ transcript }: TranscriptItemProps) {
  const isCustomer = transcript.speaker === 'customer';

  return (
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
          'flex-1 max-w-[80%] rounded-lg px-4 py-2',
          isCustomer
            ? 'bg-slate-100 text-slate-900'
            : 'bg-primary/10 text-slate-900',
          !transcript.isFinal && 'text-gray-400 italic'
        )}
      >
        <p className="text-sm leading-relaxed">{transcript.text}</p>
        <span className="text-[10px] text-muted-foreground mt-1 block">
          {format(transcript.timestamp, 'HH:mm:ss')}
          {!transcript.isFinal && ' (인식 중...)'}
        </span>
      </div>
    </div>
  );
}
