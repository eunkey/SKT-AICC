'use client';

import { formatPrice } from '../lib/price-parser';

interface ImpactChartProps {
  data: {
    label: string;
    value: number;
    description?: string;
  }[];
  maxAbsValue?: number;
}

export function ImpactChart({ data, maxAbsValue }: ImpactChartProps) {
  // 최대 절대값 계산 (막대 길이 기준)
  const max = maxAbsValue || Math.max(...data.map(d => Math.abs(d.value)), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = Math.min((Math.abs(item.value) / max) * 100, 100);
        const isPositive = item.value >= 0;

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={`font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive && item.value > 0 ? '+' : ''}
                {formatPrice(item.value)}
              </span>
            </div>
            <div className="h-6 bg-muted rounded-md overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  isPositive ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
              {item.description && (
                <span className="absolute inset-0 flex items-center px-2 text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CumulativeChartProps {
  data: number[];
  labels?: string[];
}

export function CumulativeChart({ data, labels }: CumulativeChartProps) {
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 0);
  const range = max - min || 1;

  // SVG 차트 높이와 여백
  const height = 120;
  const width = 100; // percentage
  const padding = 20;

  // 0선 위치 계산
  const zeroY = padding + ((max / range) * (height - 2 * padding));

  // 데이터 포인트 계산
  const points = data.map((value, index) => {
    const x = ((index + 1) / data.length) * (width - 10) + 5;
    const y = padding + (((max - value) / range) * (height - 2 * padding));
    return { x, y, value };
  });

  // 경로 생성
  const pathD = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // 면적 경로 생성 (0선까지)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* 0선 */}
        <line
          x1="0"
          y1={zeroY}
          x2="100"
          y2={zeroY}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="2,2"
        />

        {/* 영역 */}
        <path
          d={areaD}
          fill={points[points.length - 1]?.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
          fillOpacity={0.2}
        />

        {/* 선 */}
        <path
          d={pathD}
          fill="none"
          stroke={points[points.length - 1]?.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
          strokeWidth="2"
        />

        {/* 포인트 */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={point.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
          />
        ))}
      </svg>

      {/* X축 레이블 */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
        {(labels || data.map((_, i) => `${i + 1}개월`)).map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
}

interface ComparisonChartProps {
  before: number;
  after: number;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ComparisonChart({
  before,
  after,
  beforeLabel = '현재',
  afterLabel = '해지 후',
}: ComparisonChartProps) {
  const max = Math.max(before, after);
  const beforePercentage = (before / max) * 100;
  const afterPercentage = (after / max) * 100;
  const difference = after - before;

  return (
    <div className="space-y-4">
      {/* 비교 막대 */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-16">{beforeLabel}</span>
          <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
            <div
              className="h-full bg-blue-500 flex items-center justify-end px-2"
              style={{ width: `${beforePercentage}%` }}
            >
              <span className="text-xs text-white font-medium">
                {formatPrice(before)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-16">{afterLabel}</span>
          <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
            <div
              className={`h-full flex items-center justify-end px-2 ${
                after < before ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${afterPercentage}%` }}
            >
              <span className="text-xs text-white font-medium">
                {formatPrice(after)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 차이 표시 */}
      <div className="text-center">
        <span
          className={`text-lg font-bold ${
            difference < 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {difference > 0 ? '+' : ''}
          {formatPrice(difference)}/월
        </span>
        <span className="text-sm text-muted-foreground ml-2">
          {difference < 0 ? '절약' : '증가'}
        </span>
      </div>
    </div>
  );
}
