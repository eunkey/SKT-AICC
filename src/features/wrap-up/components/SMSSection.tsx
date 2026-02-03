'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone } from 'lucide-react';
import { ExtractedTopic } from '@/types/sms';
import { TopicSelector } from './TopicSelector';
import { SMSPreview } from './SMSPreview';

interface SMSSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  topics: ExtractedTopic[];
  selectedTopicIds: string[];
  onSelectedTopicIdsChange: (ids: string[]) => void;
  smsContent: string;
  onSmsContentChange: (content: string) => void;
  recipient: string;
  customerName: string;
}

export function SMSSection({
  enabled,
  onEnabledChange,
  topics,
  selectedTopicIds,
  onSelectedTopicIdsChange,
  smsContent,
  onSmsContentChange,
  recipient,
  customerName,
}: SMSSectionProps) {
  const maskedRecipient = recipient.replace(
    /(\d{3})-?(\d{4})-?(\d{4})/,
    '$1-****-$3'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="send-sms"
            checked={enabled}
            onCheckedChange={(checked) => onEnabledChange(checked === true)}
          />
          <Label htmlFor="send-sms" className="text-sm font-medium cursor-pointer">
            안내 SMS 발송
          </Label>
        </div>
        {enabled && recipient && (
          <Badge variant="secondary" className="gap-1.5">
            <Phone className="w-3 h-3" />
            {maskedRecipient}
          </Badge>
        )}
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* 토픽 선택 영역 */}
          <TopicSelector
            topics={topics}
            selectedIds={selectedTopicIds}
            onSelectionChange={onSelectedTopicIdsChange}
          />

          {/* SMS 미리보기 영역 */}
          <SMSPreview
            topics={topics}
            selectedIds={selectedTopicIds}
            customerName={customerName}
            editedContent={smsContent}
            onContentChange={onSmsContentChange}
          />

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            마무리 완료 시 선택한 항목이 자동 발송됩니다
          </p>
        </div>
      )}
    </div>
  );
}
