'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';

interface CallSummarySectionProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

export function CallSummarySection({
  summary,
  onSummaryChange,
}: CallSummarySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);

  const handleSave = () => {
    onSummaryChange(editedSummary);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(summary);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">통화 요약</Label>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            편집
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-3 h-3 mr-1" />
              취소
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-3 h-3 mr-1" />
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none bg-muted/50 rounded-lg p-4">
          <div className="whitespace-pre-wrap text-sm">{summary}</div>
        </div>
      )}
    </div>
  );
}
