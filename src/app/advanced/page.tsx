'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components';
import { ConversationStream, AIConversationControls } from '@/features/transcript/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallStore, useUIStore, useTranscriptStore, useAIAnalysisStore } from '@/stores';
import { Phone, PhoneOff, Pause, Play, CreditCard, Plane, Gift, Tag, User } from 'lucide-react';
import {
  CustomerProfile,
  PlanTable,
  RoamingTable,
  AddonServiceTable,
  DiscountTable,
} from '@/features/advanced/components';
import { WrapUpModal } from '@/features/wrap-up/components';

export default function AdvancedPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const { callStatus, startCall, endCall, holdCall, resumeCall, reset } = useCallStore();
  const { openModal } = useUIStore();
  const { clearTranscripts } = useTranscriptStore();
  const { reset: resetAI } = useAIAnalysisStore();

  // 통화 시작
  const handleStartCall = () => {
    clearTranscripts();
    resetAI();
    startCall('session-' + Date.now(), {
      name: '김민수',
      phone: '010-1234-5678',
      customerId: 'SKT-001',
    });
  };

  // 통화 종료
  const handleEndCall = () => {
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

  // 새 통화
  const handleNewCall = () => {
    reset();
    resetAI();
  };

  const isCallActive = callStatus !== 'idle' && callStatus !== 'wrap-up';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* 통화 컨트롤 바 */}
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {callStatus === 'idle' ? (
              <Button onClick={handleStartCall} className="gap-2 bg-[#E4002B] hover:bg-[#C4002B]">
                <Phone className="w-4 h-4" />
                상담 시작
              </Button>
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

                {/* AI 대화 모드 컨트롤 */}
                <AIConversationControls isCallActive={isCallActive} />
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

        {/* 메인 컨텐츠 영역 - 1:2 비율 레이아웃 */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 왼쪽: 실시간 대화 스트림 (1칸) */}
            <div className="h-full min-h-0">
              <ConversationStream />
            </div>

            {/* 오른쪽: 고객 정보 & 서비스 관리 (2칸) */}
            <div className="h-full min-h-0 lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    고객 서비스 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col"
                  >
                    <div className="border-b px-4">
                      <TabsList className="h-10">
                        <TabsTrigger value="profile" className="text-xs gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          프로필
                        </TabsTrigger>
                        <TabsTrigger value="plans" className="text-xs gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          요금제
                        </TabsTrigger>
                        <TabsTrigger value="roaming" className="text-xs gap-1.5">
                          <Plane className="w-3.5 h-3.5" />
                          로밍
                        </TabsTrigger>
                        <TabsTrigger value="addons" className="text-xs gap-1.5">
                          <Gift className="w-3.5 h-3.5" />
                          부가서비스
                        </TabsTrigger>
                        <TabsTrigger value="discounts" className="text-xs gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          할인
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-auto">
                      {/* 프로필 탭 */}
                      <TabsContent value="profile" className="mt-0 p-4">
                        <CustomerProfile
                          name="김민수"
                          phone="010-1234-5678"
                          gender="남"
                          age={34}
                          location="서울특별시 강남구"
                          currentPlan="5G 프리미엄"
                        />
                      </TabsContent>

                      {/* 요금제 탭 */}
                      <TabsContent value="plans" className="mt-0 p-4 space-y-4">
                        <div className="mb-4">
                          <CustomerProfile
                            name="김민수"
                            phone="010-1234-5678"
                            gender="남"
                            age={34}
                            location="서울특별시 강남구"
                            currentPlan="5G 프리미엄"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold mb-3">요금제 선택</h3>
                          <PlanTable currentPlanId="5g-premium" />
                        </div>
                      </TabsContent>

                      {/* 로밍 탭 */}
                      <TabsContent value="roaming" className="mt-0 p-4">
                        <h3 className="text-sm font-semibold mb-3">로밍 서비스</h3>
                        <RoamingTable />
                      </TabsContent>

                      {/* 부가서비스 탭 */}
                      <TabsContent value="addons" className="mt-0 p-4">
                        <h3 className="text-sm font-semibold mb-3">부가 서비스</h3>
                        <AddonServiceTable
                          selectedServices={['addon-caller-id', 'addon-tmap', 'addon-music']}
                        />
                      </TabsContent>

                      {/* 할인 탭 */}
                      <TabsContent value="discounts" className="mt-0 p-4">
                        <h3 className="text-sm font-semibold mb-3">할인 혜택</h3>
                        <DiscountTable
                          selectedDiscounts={['discount-contract-24', 'discount-auto-pay']}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 통화 마무리 모달 */}
      <WrapUpModal />
    </DashboardLayout>
  );
}
