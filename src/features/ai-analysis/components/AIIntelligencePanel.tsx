'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIAnalysisStore } from '@/stores';
import { Bot, History } from 'lucide-react';
import { SearchQuerySection } from './SearchQuerySection';
import { SummarySection } from './SummarySection';
import { RelatedDocsSection } from './RelatedDocsSection';
import { RecommendedScriptSection } from './RecommendedScriptSection';
import { HistoryTab } from './HistoryTab';
import { SkeletonLoader } from './SkeletonLoader';

export function AIIntelligencePanel() {
  const { currentResult, isLoading, error } = useAIAnalysisStore();
  const [activeTab, setActiveTab] = useState('current');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI 인텔리전스
          {isLoading && (
            <span className="text-xs text-muted-foreground font-normal animate-pulse">
              분석 중...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-10">
              <TabsTrigger value="current" className="text-xs">
                현재 분석
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="w-3 h-3 mr-1" />
                히스토리
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="current" className="flex-1 mt-0 overflow-auto">
            <div className="p-4 space-y-4">
              {isLoading ? (
                <SkeletonLoader />
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              ) : currentResult ? (
                <>
                  <SearchQuerySection query={currentResult.query} />
                  <SummarySection summary={currentResult.summary} />
                  <RelatedDocsSection documents={currentResult.documents} />
                  <RecommendedScriptSection script={currentResult.recommendedScript} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm text-center">
                    AI 분석 버튼을 클릭하거나
                    <br />
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+A</kbd>
                    를 눌러 분석을 시작하세요.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 mt-0 overflow-auto">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
