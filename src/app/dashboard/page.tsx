'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components';
import { ConversationStream, STTControls, AIConversationControls } from '@/features/transcript/components';
import { AIIntelligencePanel, AITriggerFAB } from '@/features/ai-analysis/components';
import { DocumentSearchPanel } from '@/features/search';
import { WrapUpModal } from '@/features/wrap-up/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCallStore, useUIStore, useTranscriptStore, useAIAnalysisStore } from '@/stores';
import { useMockSTT } from '@/features/transcript/hooks/useMockSTT';
import { Phone, PhoneOff, Pause, Play, Mic, PlayCircle, Bot, Search, Brain } from 'lucide-react';

type STTMode = 'mock' | 'real' | 'ai';
type RightPanelTab = 'ai' | 'search';

export default function DashboardPage() {
  const [sttMode, setSTTMode] = useState<STTMode>('ai');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('ai');

  const { callStatus, startCall, endCall, holdCall, resumeCall, reset } = useCallStore();
  const { openModal } = useUIStore();
  const { clearTranscripts } = useTranscriptStore();
  const { reset: resetAI } = useAIAnalysisStore();
  const { isPlaying, startConversation, stopConversation, resetConversation } = useMockSTT();

  // 통화 시작
  const handleStartCall = () => {
    clearTranscripts();
    resetAI();
    startCall('session-' + Date.now(), {
      name: '김민수',
      phone: '010-1234-5678',
      customerId: 'SKT-001',
    });

    // Mock 모드일 때만 자동 시작
    if (sttMode === 'mock') {
      startConversation();
    }
  };

  // 통화 종료
  const handleEndCall = () => {
    if (sttMode === 'mock') {
      stopConversation();
    }
    endCall();
    openModal('wrap-up');
  };

  // 통화 보류/재개
  const handleToggleHold = () => {
    if (callStatus === 'hold') {
      resumeCall();
    } else {
      holdCall();
    }
  };

  // 새 통화 (모달 완료 후)
  const handleNewCall = () => {
    reset();
    resetConversation();
    resetAI();
  };

  // Mock 데모 재생
  const handlePlayDemo = () => {
    if (!isPlaying) {
      startConversation();
    } else {
      stopConversation();
    }
  };

  const isCallActive = callStatus !== 'idle' && callStatus !== 'wrap-up';

  const getModeDescription = () => {
    switch (sttMode) {
      case 'mock':
        return '데모 모드: 요금제 변경 시나리오 재생';
      case 'real':
        return '실시간 모드: 마이크 녹음만';
      case 'ai':
        return 'AI 대화 모드: 고객 음성 → AI 상담사 응답';
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* 통화 컨트롤 바 */}
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {callStatus === 'idle' ? (
              <>
                {/* STT 모드 선택 */}
                <Tabs value={sttMode} onValueChange={(v) => setSTTMode(v as STTMode)}>
                  <TabsList className="h-9">
                    <TabsTrigger value="ai" className="text-xs gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      AI 대화
                    </TabsTrigger>
                    <TabsTrigger value="mock" className="text-xs gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5" />
                      데모
                    </TabsTrigger>
                    <TabsTrigger value="real" className="text-xs gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      실시간
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button onClick={handleStartCall} className="gap-2 bg-[#E4002B] hover:bg-[#C4002B]">
                  <Phone className="w-4 h-4" />
                  상담 시작
                </Button>

                <Badge variant="outline" className="text-xs">
                  {getModeDescription()}
                </Badge>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleEndCall}
                  className="gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  상담 종료
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleHold}
                  className="gap-2"
                >
                  {callStatus === 'hold' ? (
                    <>
                      <Play className="w-4 h-4" />
                      재개
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      보류
                    </>
                  )}
                </Button>

                {/* Mock 모드: 데모 재생 컨트롤 */}
                {sttMode === 'mock' && isCallActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayDemo}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        일시정지
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        데모 재생
                      </>
                    )}
                  </Button>
                )}

                {/* Real 모드: STT 컨트롤 */}
                {sttMode === 'real' && (
                  <STTControls isCallActive={isCallActive} />
                )}

                {/* AI 대화 모드: AI 대화 컨트롤 */}
                {sttMode === 'ai' && (
                  <AIConversationControls isCallActive={isCallActive} />
                )}
              </>
            )}
          </div>

          {callStatus === 'wrap-up' && (
            <Button variant="outline" onClick={handleNewCall} className="gap-2">
              <Phone className="w-4 h-4" />
              새 상담
            </Button>
          )}
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Zone A: 실시간 대화 스트림 */}
            <div className="h-full min-h-0">
              <ConversationStream />
            </div>

            {/* Zone B: AI 인텔리전스 / 문서 검색 패널 */}
            <div className="h-full min-h-0 flex flex-col">
              <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as RightPanelTab)} className="h-full flex flex-col">
                <TabsList className="w-full justify-start mb-2">
                  <TabsTrigger value="ai" className="gap-1.5">
                    <Brain className="w-4 h-4" />
                    AI 분석
                  </TabsTrigger>
                  <TabsTrigger value="search" className="gap-1.5">
                    <Search className="w-4 h-4" />
                    문서 검색
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="flex-1 mt-0 min-h-0">
                  <AIIntelligencePanel />
                </TabsContent>
                <TabsContent value="search" className="flex-1 mt-0 min-h-0">
                  <DocumentSearchPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* AI 트리거 FAB */}
      <AITriggerFAB />

      {/* Zone C: 통화 마무리 모달 */}
      <WrapUpModal />
    </DashboardLayout>
  );
}
