'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Device {
  id: string;
  name: string;
  retailPrice: number;
  subsidy: number;
  actualPrice: number;
  monthlyInstallment: number;
}

export const DEVICES: Device[] = [
  // MZ세대 인기 모델 10종
  { id: 'mz-1', name: 'iPhone 17 Pro 256GB', retailPrice: 1782000, subsidy: 100000, actualPrice: 1682000, monthlyInstallment: 70083 },
  { id: 'mz-2', name: 'iPhone 17 256GB', retailPrice: 1287000, subsidy: 150000, actualPrice: 1137000, monthlyInstallment: 47375 },
  { id: 'mz-3', name: 'iPhone 17 Pro Max 256GB', retailPrice: 1980000, subsidy: 100000, actualPrice: 1880000, monthlyInstallment: 78333 },
  { id: 'mz-4', name: 'Galaxy S25', retailPrice: 1155000, subsidy: 250000, actualPrice: 905000, monthlyInstallment: 37708 },
  { id: 'mz-5', name: 'Galaxy S25 Ultra', retailPrice: 1698400, subsidy: 250000, actualPrice: 1448400, monthlyInstallment: 60350 },
  { id: 'mz-6', name: 'Galaxy S25+', retailPrice: 1353000, subsidy: 250000, actualPrice: 1103000, monthlyInstallment: 45958 },
  { id: 'mz-7', name: 'Galaxy Z Flip7', retailPrice: 1485000, subsidy: 240000, actualPrice: 1245000, monthlyInstallment: 51875 },
  { id: 'mz-8', name: 'Galaxy Z Fold7', retailPrice: 2379300, subsidy: 250000, actualPrice: 2129300, monthlyInstallment: 88721 },
  { id: 'mz-9', name: 'Galaxy S25 FE', retailPrice: 946000, subsidy: 200000, actualPrice: 746000, monthlyInstallment: 31083 },
  { id: 'mz-10', name: 'iPhone Air', retailPrice: 1584000, subsidy: 150000, actualPrice: 1434000, monthlyInstallment: 59750 },

  // 시니어 인기 모델 10종
  { id: 'sr-1', name: 'Galaxy A56 5G', retailPrice: 650000, subsidy: 250000, actualPrice: 400000, monthlyInstallment: 16667 },
  { id: 'sr-2', name: 'Galaxy A36 5G', retailPrice: 499000, subsidy: 200000, actualPrice: 299000, monthlyInstallment: 12458 },
  { id: 'sr-3', name: 'Galaxy A26 5G', retailPrice: 450000, subsidy: 200000, actualPrice: 250000, monthlyInstallment: 10417 },
  { id: 'sr-4', name: 'Galaxy A15 5G', retailPrice: 399000, subsidy: 150000, actualPrice: 249000, monthlyInstallment: 10375 },
  { id: 'sr-5', name: 'Galaxy S25', retailPrice: 1155000, subsidy: 250000, actualPrice: 905000, monthlyInstallment: 37708 },
  { id: 'sr-6', name: 'Galaxy S25 FE', retailPrice: 946000, subsidy: 220000, actualPrice: 726000, monthlyInstallment: 30250 },
  { id: 'sr-7', name: 'Galaxy Z Flip7 FE', retailPrice: 1199000, subsidy: 250000, actualPrice: 949000, monthlyInstallment: 39542 },
  { id: 'sr-8', name: 'iPhone 17', retailPrice: 1287000, subsidy: 150000, actualPrice: 1137000, monthlyInstallment: 47375 },
  { id: 'sr-9', name: 'Galaxy Quantum 6', retailPrice: 618000, subsidy: 200000, actualPrice: 418000, monthlyInstallment: 17417 },
  { id: 'sr-10', name: 'Galaxy A24', retailPrice: 330000, subsidy: 150000, actualPrice: 180000, monthlyInstallment: 7500 },

  // 중고등학생 인기 모델 10종
  { id: 'st-1', name: 'Galaxy A36 5G', retailPrice: 499000, subsidy: 200000, actualPrice: 299000, monthlyInstallment: 12458 },
  { id: 'st-2', name: 'Galaxy A26 5G', retailPrice: 450000, subsidy: 200000, actualPrice: 250000, monthlyInstallment: 10417 },
  { id: 'st-3', name: 'Galaxy A56 5G', retailPrice: 650000, subsidy: 250000, actualPrice: 400000, monthlyInstallment: 16667 },
  { id: 'st-4', name: 'Galaxy S25 FE', retailPrice: 946000, subsidy: 220000, actualPrice: 726000, monthlyInstallment: 30250 },
  { id: 'st-5', name: 'Galaxy A15 5G', retailPrice: 399000, subsidy: 150000, actualPrice: 249000, monthlyInstallment: 10375 },
  { id: 'st-6', name: 'Galaxy M36 5G (SKT 전용)', retailPrice: 520000, subsidy: 200000, actualPrice: 320000, monthlyInstallment: 13333 },
  { id: 'st-7', name: 'Galaxy Z Flip7 FE', retailPrice: 1199000, subsidy: 250000, actualPrice: 949000, monthlyInstallment: 39542 },
  { id: 'st-8', name: 'iPhone SE3 (잔여 재고)', retailPrice: 550000, subsidy: 100000, actualPrice: 450000, monthlyInstallment: 18750 },
  { id: 'st-9', name: 'iPhone 14 (저가 프로모션)', retailPrice: 1090000, subsidy: 200000, actualPrice: 890000, monthlyInstallment: 37083 },
  { id: 'st-10', name: 'iPhone 15', retailPrice: 1350000, subsidy: 200000, actualPrice: 1150000, monthlyInstallment: 47917 },
];

function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR') + '원';
}

interface DeviceTableProps {
  selectedDevice?: string[];
  onSelect?: (deviceId: string) => void;
}

export function DeviceTable({ selectedDevice = [], onSelect }: DeviceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedDevice));

  const handleSelect = (deviceId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelected(newSelected);
    onSelect?.(deviceId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">모델명</TableHead>
            <TableHead className="whitespace-nowrap text-right">공시가</TableHead>
            <TableHead className="whitespace-nowrap text-right">공시지원금</TableHead>
            <TableHead className="whitespace-nowrap text-right">실구매가</TableHead>
            <TableHead className="whitespace-nowrap text-right">월 납부(24M)</TableHead>
            <TableHead className="text-right whitespace-nowrap">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEVICES.map((device) => {
            const isSelected = selected.has(device.id);
            return (
              <TableRow
                key={device.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium text-xs whitespace-nowrap">{device.name}</TableCell>
                <TableCell className="text-xs text-right whitespace-nowrap">{formatPrice(device.retailPrice)}</TableCell>
                <TableCell className="text-xs text-right whitespace-nowrap text-green-600">{formatPrice(device.subsidy)}</TableCell>
                <TableCell className="text-xs text-right whitespace-nowrap font-semibold">{formatPrice(device.actualPrice)}</TableCell>
                <TableCell className="text-xs text-right whitespace-nowrap font-semibold">{formatPrice(device.monthlyInstallment)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isSelected ? 'secondary' : 'default'}
                    onClick={() => handleSelect(device.id)}
                    className={isSelected ? 'bg-gray-400 hover:bg-gray-500' : ''}
                  >
                    {isSelected ? '사용 중' : '선택'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
