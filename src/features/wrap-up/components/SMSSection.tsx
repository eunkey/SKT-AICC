'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone } from 'lucide-react';

interface SMSSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  content: string;
  onContentChange: (content: string) => void;
  recipient: string;
}

export function SMSSection({
  enabled,
  onEnabledChange,
  content,
  onContentChange,
  recipient,
}: SMSSectionProps) {
  const maskedRecipient = recipient.replace(
    /(\d{3})-?(\d{4})-?(\d{4})/,
    '$1-****-$3'
  );

  return (
    <div className="space-y-3">
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
        {enabled && (
          <Badge variant="secondary" className="gap-1.5">
            <Phone className="w-3 h-3" />
            {maskedRecipient}
          </Badge>
        )}
      </div>

      {enabled && (
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={5}
              className="pr-16"
              placeholder="SMS 내용을 입력하세요"
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {content.length}/90자
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            마무리 완료 시 자동 발송됩니다
          </p>
        </div>
      )}
    </div>
  );
}
