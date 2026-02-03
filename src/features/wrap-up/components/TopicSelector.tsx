'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExtractedTopic, TOPIC_LABELS } from '@/types/sms';
import { cn } from '@/lib/utils';

interface TopicSelectorProps {
  topics: ExtractedTopic[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function TopicSelector({
  topics,
  selectedIds,
  onSelectionChange,
}: TopicSelectorProps) {
  const handleToggle = (topicId: string) => {
    if (selectedIds.includes(topicId)) {
      onSelectionChange(selectedIds.filter((id) => id !== topicId));
    } else {
      onSelectionChange([...selectedIds, topicId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === topics.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(topics.map((t) => t.id));
    }
  };

  if (topics.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        추출된 토픽이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">발송할 항목 선택</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-primary hover:underline"
        >
          {selectedIds.length === topics.length ? '전체 해제' : '전체 선택'}
        </button>
      </div>

      <div className="space-y-2">
        {topics.map((topic) => {
          const isSelected = selectedIds.includes(topic.id);
          return (
            <div
              key={topic.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                isSelected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/30'
              )}
              onClick={() => handleToggle(topic.id)}
            >
              <Checkbox
                id={`topic-${topic.id}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(topic.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`topic-${topic.id}`}
                  className="text-sm font-medium cursor-pointer block"
                >
                  {topic.title}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {topic.summary}
                </p>
                <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                  {TOPIC_LABELS[topic.type]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
