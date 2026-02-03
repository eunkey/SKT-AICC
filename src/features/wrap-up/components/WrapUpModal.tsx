'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore, useCallStore, useTranscriptStore } from '@/stores';
import { SecurityBadge } from './SecurityBadge';
import { CallSummarySection } from './CallSummarySection';
import { SMSSection } from './SMSSection';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, X } from 'lucide-react';
import { maskPII } from '@/lib/pii-masking';
import { ExtractedTopic } from '@/types/sms';

export function WrapUpModal() {
  const { activeModal, closeModal } = useUIStore();
  const { customerInfo, reset: resetCall, callDuration } = useCallStore();
  const { getFullText, clearTranscripts } = useTranscriptStore();

  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [piiStatus, setPiiStatus] = useState<'processing' | 'complete' | 'error'>('processing');
  const [sendSMS, setSendSMS] = useState(true);
  const [smsContent, setSmsContent] = useState('');

  // 토픽 관련 상태
  const [topics, setTopics] = useState<ExtractedTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const isOpen = activeModal === 'wrap-up';

  // 실제 대화 내용 기반 AI 요약 생성
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setPiiStatus('processing');
      setTopics([]);
      setSelectedTopicIds([]);
      setSmsContent('');

      const generateSummary = async () => {
        const transcript = getFullText();

        // 대화 내용이 없으면 기본 메시지 표시
        if (!transcript || transcript.trim().length === 0) {
          setSummary(`## 상담 요약

**고객명**: ${customerInfo?.name || '고객'}
**상담 시간**: ${Math.floor(callDuration / 60)}분 ${callDuration % 60}초

### 문의 내용
- 대화 내용이 기록되지 않았습니다.

### 처리 내용
- 상담 내용을 확인할 수 없습니다.`);

          const defaultTopic: ExtractedTopic = {
            id: 'topic_default',
            type: 'general',
            title: '상담 안내',
            summary: '상담이 완료되었습니다',
            keyInfo: {},
            smsContent: `[SK텔레콤] ${customerInfo?.name || '고객'}님, 상담이 완료되었습니다.\n\n문의: 114`,
          };
          setTopics([defaultTopic]);
          setSelectedTopicIds([defaultTopic.id]);
          setPiiStatus('complete');
          setIsGenerating(false);
          return;
        }

        try {
          const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transcript,
              customerName: customerInfo?.name,
              callDuration,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate summary');
          }

          const data = await response.json();

          // PII 마스킹 적용
          const masked = maskPII(data.summary);
          setSummary(masked.masked);

          // 토픽 설정
          if (data.topics && data.topics.length > 0) {
            setTopics(data.topics);
            // 기본적으로 모든 토픽 선택
            setSelectedTopicIds(data.topics.map((t: ExtractedTopic) => t.id));
          } else {
            // 토픽이 없는 경우 기본 토픽
            const defaultTopic: ExtractedTopic = {
              id: 'topic_default',
              type: 'general',
              title: '상담 안내',
              summary: '상담이 완료되었습니다',
              keyInfo: {},
              smsContent: `[SK텔레콤] ${customerInfo?.name || '고객'}님, 상담이 완료되었습니다.\n\n문의: 114`,
            };
            setTopics([defaultTopic]);
            setSelectedTopicIds([defaultTopic.id]);
          }

          setPiiStatus('complete');
        } catch (error) {
          console.error('Summary generation error:', error);
          // 에러 시 기본 요약
          setSummary(`## 상담 요약

**고객명**: ${customerInfo?.name || '고객'}
**상담 시간**: ${Math.floor(callDuration / 60)}분 ${callDuration % 60}초

### 대화 기록
${transcript}

(AI 요약 생성에 실패했습니다. 위 대화 기록을 참고해주세요.)`);

          const defaultTopic: ExtractedTopic = {
            id: 'topic_default',
            type: 'general',
            title: '상담 안내',
            summary: '상담이 완료되었습니다',
            keyInfo: {},
            smsContent: `[SK텔레콤] ${customerInfo?.name || '고객'}님, 상담이 완료되었습니다.\n\n문의: 114`,
          };
          setTopics([defaultTopic]);
          setSelectedTopicIds([defaultTopic.id]);
          setPiiStatus('error');
        } finally {
          setIsGenerating(false);
        }
      };

      generateSummary();
    }
  }, [isOpen, getFullText, customerInfo, callDuration]);

  const handleComplete = () => {
    // 상태 초기화 및 모달 닫기
    closeModal();
    clearTranscripts();
    resetCall();
  };

  const handleClose = () => {
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">상담 마무리</DialogTitle>
            <SecurityBadge status={piiStatus} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {isGenerating ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* 왼쪽: 상담 요약 */}
              <div className="min-h-0">
                <CallSummarySection
                  summary={summary}
                  onSummaryChange={setSummary}
                />
              </div>

              {/* 오른쪽: SMS 전송 */}
              <div className="min-h-0 overflow-y-auto">
                <SMSSection
                  enabled={sendSMS}
                  onEnabledChange={setSendSMS}
                  topics={topics}
                  selectedTopicIds={selectedTopicIds}
                  onSelectedTopicIdsChange={setSelectedTopicIds}
                  smsContent={smsContent}
                  onSmsContentChange={setSmsContent}
                  recipient={customerInfo?.phone || ''}
                  customerName={customerInfo?.name || '고객'}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
          <Button onClick={handleComplete} disabled={isGenerating} className="bg-[#E4002B] hover:bg-[#C4002B]">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            마무리 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
