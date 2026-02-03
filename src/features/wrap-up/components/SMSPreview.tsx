'use client';

import { useState, useMemo, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExtractedTopic } from '@/types/sms';
import { Pencil, Check, X } from 'lucide-react';

interface SMSPreviewProps {
  topics: ExtractedTopic[];
  selectedIds: string[];
  customerName: string;
  editedContent: string;
  onContentChange: (content: string) => void;
}

export function SMSPreview({
  topics,
  selectedIds,
  customerName,
  editedContent,
  onContentChange,
}: SMSPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState('');

  // 선택된 토픽 기반 SMS 내용 생성
  const generatedContent = useMemo(() => {
    const selectedTopics = topics.filter((t) => selectedIds.includes(t.id));

    if (selectedTopics.length === 0) {
      return `[SK텔레콤] 고객센터입니다.\n\n${customerName}님, 상담이 완료되었습니다.\n\n문의: 114`;
    }

    if (selectedTopics.length === 1) {
      // 토픽이 하나면 해당 토픽의 SMS 내용만 반환
      return selectedTopics[0].smsContent;
    }

    // 여러 토픽이 선택된 경우 통합 SMS 생성
    const lines: string[] = [
      '[SK텔레콤] 고객센터입니다.',
      '',
      `${customerName}님, 상담 내용 안내드립니다.`,
      '',
    ];

    selectedTopics.forEach((topic) => {
      lines.push(`▶ ${topic.title}`);

      // keyInfo가 있으면 bullet으로 추가
      const keyInfoEntries = Object.entries(topic.keyInfo);
      if (keyInfoEntries.length > 0) {
        keyInfoEntries.slice(0, 3).forEach(([key, value]) => {
          lines.push(`• ${key}: ${value}`);
        });
      } else {
        lines.push(`• ${topic.summary}`);
      }
      lines.push('');
    });

    lines.push('※ T월드 앱에서 확인 가능');
    lines.push('문의: 114');

    return lines.join('\n');
  }, [topics, selectedIds, customerName]);

  // 선택 변경 시 편집 내용 초기화 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEditing) {
      onContentChange(generatedContent);
    }
  }, [generatedContent, isEditing, onContentChange]);

  const displayContent = editedContent || generatedContent;
  const charCount = displayContent.length;
  const messageType = charCount <= 90 ? 'SMS' : 'LMS';

  const handleEdit = () => {
    setTempContent(displayContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    onContentChange(tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent('');
    setIsEditing(false);
  };

  if (selectedIds.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground text-center py-8">
          발송할 항목을 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SMS 미리보기</span>
        {!isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-7 text-xs"
          >
            <Pencil className="w-3 h-3 mr-1" />
            편집
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-7 text-xs text-green-600 hover:text-green-700"
            >
              <Check className="w-3 h-3 mr-1" />
              저장
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-7 text-xs text-muted-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              취소
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        {isEditing ? (
          <Textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            rows={12}
            className="border-0 resize-none text-sm focus-visible:ring-0"
            placeholder="SMS 내용을 입력하세요"
          />
        ) : (
          <div className="p-3 bg-muted/20 min-h-[200px] max-h-[280px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {displayContent}
            </pre>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {charCount}자 ({messageType})
        </span>
      </div>
    </div>
  );
}
