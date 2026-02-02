'use client';

import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, ExternalLink } from 'lucide-react';

interface Document {
  title: string;
  url: string;
  relevance: number;
}

interface RelatedDocsSectionProps {
  documents: Document[];
}

export function RelatedDocsSection({ documents }: RelatedDocsSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <FileText className="w-3 h-3" />
        관련 문서 ({documents.length})
      </Label>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {doc.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={doc.relevance * 100} className="h-1.5 flex-1 max-w-24" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(doc.relevance * 100)}% 일치
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
