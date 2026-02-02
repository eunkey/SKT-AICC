'use client';

import { DashboardLayout } from '@/features/dashboard/components';
import { HistoryList } from '@/features/history/components';

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] p-4">
        <HistoryList />
      </div>
    </DashboardLayout>
  );
}
