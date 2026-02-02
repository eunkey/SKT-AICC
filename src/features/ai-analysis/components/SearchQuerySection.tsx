'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Edit2, X, RotateCcw } from 'lucide-react';
import { useMockAI } from '../hooks/useMockAI';

interface SearchQuerySectionProps {
  query: string;
}

export function SearchQuerySection({ query }: SearchQuerySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuery, setEditedQuery] = useState(query);
  const { reanalyzeWithQuery } = useMockAI();

  const handleReanalyze = async () => {
    if (editedQuery.trim()) {
      await reanalyzeWithQuery(editedQuery);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedQuery(query);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <Search className="w-3 h-3" />
        검색 쿼리
      </Label>
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={editedQuery}
            onChange={(e) => setEditedQuery(e.target.value)}
            className="text-sm"
            placeholder="검색어를 입력하세요"
          />
          <Button size="sm" onClick={handleReanalyze}>
            <RotateCcw className="w-3 h-3 mr-1" />
            재분석
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
            {query}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
