'use client';

import { TranscriptEntry } from '@/stores';
import { TranscriptItem } from './TranscriptItem';

interface TranscriptListProps {
  transcripts: TranscriptEntry[];
}

export function TranscriptList({ transcripts }: TranscriptListProps) {
  return (
    <div className="space-y-3">
      {transcripts.map((transcript) => (
        <TranscriptItem key={transcript.id} transcript={transcript} />
      ))}
    </div>
  );
}
