'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Loader2, Target } from 'lucide-react';
import { useUIStore } from '@/stores';

interface Document {
  title: string;
  url: string;
  relevance: number;
  focusSection?: string;
}

interface RelatedDocsSectionProps {
  documents: Document[];
}

export function RelatedDocsSection({ documents }: RelatedDocsSectionProps) {
  const { setSelectedDocument } = useUIStore();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleDocumentClick = async (doc: Document, index: number) => {
    setLoadingIndex(index);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: doc.url }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedDocument(data);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <FileText className="w-3 h-3" />
        관련 문서 ({documents.length})
      </Label>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <button
            key={index}
            onClick={() => handleDocumentClick(doc, index)}
            disabled={loadingIndex !== null}
            className="w-full text-left flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {doc.title}
              </p>
              {doc.focusSection && (
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-orange-500" />
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-orange-600 border-orange-200 bg-orange-50">
                    {doc.focusSection}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Progress value={doc.relevance * 100} className="h-1.5 flex-1 max-w-24" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(doc.relevance * 100)}% 일치
                </span>
              </div>
            </div>
            {loadingIndex === index ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
