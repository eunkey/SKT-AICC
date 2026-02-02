'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { CancellationAnalysis, CancellationTargetType } from '../types';
import { formatPrice, formatPriceWithSign } from '../lib/price-parser';
import { ImpactChart, CumulativeChart } from './ImpactChart';

interface CancellationAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: CancellationAnalysis | null;
}

export function CancellationAnalysisModal({
  isOpen,
  onClose,
  analysis,
}: CancellationAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('short');

  if (!analysis) return null;

  const getRecommendationIcon = () => {
    switch (analysis.recommendation.type) {
      case 'proceed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'wait':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'alternative':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRecommendationBadge = () => {
    switch (analysis.recommendation.type) {
      case 'proceed':
        return <Badge className="bg-green-500">해지 권장</Badge>;
      case 'wait':
        return <Badge className="bg-yellow-500">대기 권장</Badge>;
      case 'alternative':
        return <Badge className="bg-blue-500">대안 검토</Badge>;
    }
  };

  const getTargetTypeLabel = (type: CancellationTargetType) => {
    switch (type) {
      case 'plan':
        return '요금제';
      case 'addon':
        return '부가서비스';
      case 'discount':
        return '할인';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>해지 손익 분석:</span>
            <Badge variant="outline">
              {getTargetTypeLabel(analysis.targetType)}
            </Badge>
            <span className="font-bold">{analysis.targetName}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="short" className="text-sm">
              단기 (1-3개월)
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-sm">
              중기 (6-12개월)
            </TabsTrigger>
            <TabsTrigger value="long" className="text-sm">
              장기 (2-3년)
            </TabsTrigger>
          </TabsList>

          {/* 단기 분석 */}
          <TabsContent value="short" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">즉시 영향</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 즉시 비용 */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {analysis.shortTerm.immediateCost < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm">즉시 비용 (위약금/수수료)</span>
                  </div>
                  <span
                    className={`font-bold ${
                      analysis.shortTerm.immediateCost < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatPrice(analysis.shortTerm.immediateCost)}
                  </span>
                </div>

                {/* 월 변화 */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {analysis.shortTerm.monthlyChange > 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm">월 비용 변화</span>
                  </div>
                  <span
                    className={`font-bold ${
                      analysis.shortTerm.monthlyChange > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatPriceWithSign(analysis.shortTerm.monthlyChange)}/월
                  </span>
                </div>

                {/* 구분선 */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span className="font-semibold">3개월 총 영향</span>
                    <span
                      className={`text-xl font-bold ${
                        analysis.shortTerm.totalImpact < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formatPrice(analysis.shortTerm.totalImpact)}
                    </span>
                  </div>
                </div>

                {/* 차트 */}
                <div className="pt-2">
                  <ImpactChart
                    data={[
                      {
                        label: '즉시 비용',
                        value: analysis.shortTerm.immediateCost,
                      },
                      {
                        label: '1개월 후',
                        value:
                          analysis.shortTerm.immediateCost +
                          analysis.shortTerm.monthlyChange,
                      },
                      {
                        label: '2개월 후',
                        value:
                          analysis.shortTerm.immediateCost +
                          analysis.shortTerm.monthlyChange * 2,
                      },
                      {
                        label: '3개월 후',
                        value: analysis.shortTerm.totalImpact,
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 중기 분석 */}
          <TabsContent value="medium" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">6-12개월 전망</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 손익분기점 */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">손익분기점</span>
                  </div>
                  <span className="font-bold">
                    {analysis.mediumTerm.breakEvenMonth !== null
                      ? `${analysis.mediumTerm.breakEvenMonth}개월 후`
                      : '해당 없음'}
                  </span>
                </div>

                {/* 12개월 총 영향 */}
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="font-semibold">12개월 총 영향</span>
                  <span
                    className={`text-xl font-bold ${
                      analysis.mediumTerm.totalImpact < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatPrice(analysis.mediumTerm.totalImpact)}
                  </span>
                </div>

                {/* 누적 차트 */}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    월별 누적 손익
                  </p>
                  <CumulativeChart
                    data={analysis.mediumTerm.cumulativeByMonth}
                    labels={['3월', '6월', '9월', '12월']}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 장기 분석 */}
          <TabsContent value="long" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">2-3년 장기 전망</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 예상 절감액 */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">예상 절감액 (36개월)</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatPrice(analysis.longTerm.projectedSavings)}
                  </span>
                </div>

                {/* 잃는 혜택 가치 */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm">잃는 혜택 가치</span>
                  </div>
                  <span className="font-bold text-red-600">
                    -{formatPrice(analysis.longTerm.lostBenefitsValue)}
                  </span>
                </div>

                {/* 순이익/손해 */}
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="font-semibold">36개월 순이익/손해</span>
                  <span
                    className={`text-xl font-bold ${
                      analysis.longTerm.totalNetGain >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPriceWithSign(analysis.longTerm.totalNetGain)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 연쇄 효과 */}
        {analysis.cascadeEffects.length > 0 && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                연쇄 효과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.cascadeEffects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{effect.affectedService}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        - {effect.description}
                      </span>
                      {effect.monthlyImpact > 0 && (
                        <span className="text-red-600 font-medium ml-1">
                          (+{formatPrice(effect.monthlyImpact)}/월)
                        </span>
                      )}
                      {effect.affectedMembers && effect.affectedMembers > 1 && (
                        <span className="text-muted-foreground ml-1">
                          ({effect.affectedMembers}명 영향)
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 추천 */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {getRecommendationIcon()}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">추천</span>
                  {getRecommendationBadge()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.recommendation.reason}
                </p>
                {analysis.recommendation.suggestedAction && (
                  <p className="text-sm font-medium mt-2 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {analysis.recommendation.suggestedAction}
                    {analysis.recommendation.waitMonths && (
                      <span className="text-muted-foreground">
                        ({analysis.recommendation.waitMonths}개월 후)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 닫기 버튼 */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
